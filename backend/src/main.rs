#[macro_use]
extern crate rocket;

mod constants;
mod db;
mod errors;
mod guards;
mod models;
mod routes;
mod slug;

use dotenvy::dotenv;
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::{Request, Response};
use rocket::http::Status;
use rocket::serde::json::Json;

use rocket::response::{self, Responder};

use crate::errors::ErrorBody;
use crate::guards::rate_limit::{ReadRateLimiters, SubmitRateLimiters};

/// Custom responder that adds Retry-After header to 429 responses.
struct RateLimitError;

impl<'r> Responder<'r, 'static> for RateLimitError {
    fn respond_to(self, _req: &'r Request<'_>) -> response::Result<'static> {
        let body = serde_json::json!({
            "error": "Too many requests. Please slow down.",
            "code": "RATE_LIMIT",
            "retry_after_seconds": 60
        })
        .to_string();

        Response::build()
            .status(Status::TooManyRequests)
            .header(Header::new("Retry-After", "60"))
            .header(Header::new("Content-Type", "application/json"))
            .sized_body(body.len(), std::io::Cursor::new(body))
            .ok()
    }
}

// ---------------------------------------------------------------------------
// CORS Fairing — permissive for agent-first API access
// ---------------------------------------------------------------------------

pub struct CorsFairing;

#[rocket::async_trait]
impl Fairing for CorsFairing {
    fn info(&self) -> Info {
        Info {
            name: "CORS",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, req: &'r Request<'_>, res: &mut Response<'r>) {
        let origin = req.headers().get_one("Origin").unwrap_or("*");
        // Allow any origin for public API access (agent-first platform)
        res.set_header(Header::new(
            "Access-Control-Allow-Origin",
            if origin.is_empty() { "*" } else { origin },
        ));
        res.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "GET, POST, PATCH, DELETE, OPTIONS",
        ));
        res.set_header(Header::new(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        ));
        res.set_header(Header::new(
            "Access-Control-Max-Age",
            "86400",
        ));

        // Agent discovery headers — helps agents find the API from any response
        res.set_header(Header::new("X-API-Base", "/api"));
        res.set_header(Header::new(
            "Link",
            "</.well-known/agent.json>; rel=\"agent-manifest\", </api/openapi.json>; rel=\"service-desc\"",
        ));
    }
}

// ---------------------------------------------------------------------------
// OPTIONS preflight handler (catch-all for CORS preflights)
// ---------------------------------------------------------------------------

#[options("/<_path..>")]
fn options_handler(_path: std::path::PathBuf) -> Status {
    Status::NoContent
}

// ---------------------------------------------------------------------------
// Custom error catchers
// ---------------------------------------------------------------------------

#[catch(401)]
fn unauthorized_catcher() -> Json<ErrorBody> {
    Json(ErrorBody {
        error: "Unauthorized".to_string(),
        code: "UNAUTHORIZED".to_string(),
        fields: None,
    })
}

#[catch(429)]
fn rate_limit_catcher() -> RateLimitError {
    RateLimitError
}

#[catch(404)]
fn not_found_catcher() -> Json<ErrorBody> {
    Json(ErrorBody {
        error: "Not found".to_string(),
        code: "NOT_FOUND".to_string(),
        fields: None,
    })
}

#[catch(400)]
fn bad_request_catcher() -> Json<ErrorBody> {
    Json(ErrorBody {
        error: "Bad request".to_string(),
        code: "BAD_REQUEST".to_string(),
        fields: None,
    })
}

#[catch(422)]
fn unprocessable_catcher() -> Json<ErrorBody> {
    Json(ErrorBody {
        error: "Request body could not be parsed. Ensure Content-Type is application/json and the body is valid JSON. Required fields: name (string), short_description (string), description (string, min 10 chars), website_url (string, https://), contact_email (string), categories (array of UUID strings). Optional: tags (array of strings), chains (array of UUID strings), github_url, docs_url, logo_url, api_endpoint_url, suggested_chains.".to_string(),
        code: "UNPROCESSABLE".to_string(),
        fields: None,
    })
}

#[catch(500)]
fn internal_error_catcher() -> Json<ErrorBody> {
    Json(ErrorBody {
        error: "Internal server error".to_string(),
        code: "INTERNAL_ERROR".to_string(),
        fields: None,
    })
}

// ---------------------------------------------------------------------------
// Agent-first discovery endpoints
// ---------------------------------------------------------------------------

/// GET /api/openapi.json — OpenAPI 3.0 specification
#[get("/openapi.json")]
fn openapi_spec() -> (Status, (rocket::http::ContentType, &'static str)) {
    (Status::Ok, (rocket::http::ContentType::JSON, include_str!("../openapi.json")))
}

/// GET / — Root discovery endpoint for AI agents
#[get("/")]
fn root_discovery() -> (Status, (rocket::http::ContentType, &'static str)) {
    (Status::Ok, (rocket::http::ContentType::JSON, r#"{
  "name": "AgentRadar API",
  "description": "AI-first agent application directory. Discover, search, and submit AI agent tools and services.",
  "api": "/api",
  "openapi": "/api/openapi.json",
  "agent_manifest": "/.well-known/agent.json",
  "ai_plugin": "/.well-known/ai-plugin.json",
  "health": "/api/health",
  "endpoints": {
    "listings": "/api/listings",
    "categories": "/api/categories",
    "chains": "/api/chains",
    "tags": "/api/tags",
    "submit": "/api/listings",
    "submission_search": "/api/submissions/search?q={query}",
    "submission_status": "/api/submissions/{id}/status"
  }
}"#))
}

/// GET /.well-known/ai-plugin.json — AI plugin manifest for agent frameworks
#[get("/.well-known/ai-plugin.json")]
fn ai_plugin_manifest() -> (Status, (rocket::http::ContentType, &'static str)) {
    (Status::Ok, (rocket::http::ContentType::JSON, include_str!("../ai-plugin.json")))
}

/// GET /.well-known/agent.json — Agent capabilities manifest
#[get("/.well-known/agent.json")]
fn agent_manifest() -> (Status, (rocket::http::ContentType, &'static str)) {
    (Status::Ok, (rocket::http::ContentType::JSON, include_str!("../agent.json")))
}

// ---------------------------------------------------------------------------
// Rocket launch
// ---------------------------------------------------------------------------

#[launch]
async fn rocket() -> _ {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let pool = db::connect(&database_url).await
        .expect("Failed to connect to database");

    // Run migrations automatically on startup
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    tracing::info!("{} backend starting on port {}",
        constants::APP_NAME,
        std::env::var("ROCKET_PORT").unwrap_or_else(|_| "8000".to_string()));
    tracing::info!("CORS: allowing all origins (agent-first platform)");

    rocket::build()
        .attach(CorsFairing)
        .manage(pool)
        .manage(ReadRateLimiters::new())
        .manage(SubmitRateLimiters::new())

        .register("/", catchers![
            unauthorized_catcher,
            rate_limit_catcher,
            not_found_catcher,
            bad_request_catcher,
            unprocessable_catcher,
            internal_error_catcher,
        ])
        .mount("/", routes![
            root_discovery,
            ai_plugin_manifest,
            agent_manifest,
        ])
        .mount("/api", routes![
            options_handler,
            openapi_spec,
            routes::listings::list_listings,
            routes::listings::get_listing,
            routes::listings::submit_listing,
            routes::listings::patch_reputation,
            routes::listings::health_check,
            routes::listings::search_submissions,
            routes::listings::get_submission_status,
            routes::categories::list_categories,
            routes::tags::list_tags,
            routes::chains::list_chains,
        ])
        .mount("/api/admin", routes![
            routes::admin::listings::admin_list_listings,
            routes::admin::listings::admin_get_listing,
            routes::admin::listings::admin_approve_listing,
            routes::admin::listings::admin_reject_listing,
            routes::admin::listings::admin_update_listing,
            routes::admin::listings::admin_delete_listing,
            routes::admin::listings::admin_get_stats,
            routes::admin::listings::admin_create_category,
            routes::admin::listings::admin_create_chain,
            routes::admin::listings::admin_toggle_featured,
            routes::admin::listings::admin_list_chain_suggestions,
            routes::admin::listings::admin_approve_chain_suggestion,
            routes::admin::listings::admin_reject_chain_suggestion,
        ])
}
