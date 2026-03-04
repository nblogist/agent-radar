use rocket::response::status::Custom;
use rocket::serde::json::Json;
use rocket::State;
use serde::{Deserialize, Serialize};

use crate::db::DbPool;
use crate::errors::{AppError, ErrorBody};
use crate::guards::admin_token::AdminToken;
use crate::models::listing::{CategoryRef, ChainRef, ChainSuggestion, Listing, TagRef};
use crate::routes::listings::{PaginatedResponse, PaginationMeta};

// ---------------------------------------------------------------------------
// AdminListingDetail — full listing with associated categories/tags/chains
// Used for GET /api/admin/listings/:id
// ---------------------------------------------------------------------------

#[derive(Serialize)]
pub struct AdminListingDetail {
    #[serde(flatten)]
    pub listing: Listing,
    pub categories: Vec<CategoryRef>,
    pub tags: Vec<TagRef>,
    pub chains: Vec<ChainRef>,
}

// ---------------------------------------------------------------------------
// Query params for admin listing list
// ---------------------------------------------------------------------------

#[derive(rocket::form::FromForm, Default)]
pub struct AdminListingsQuery<'r> {
    pub status: Option<&'r str>,   // pending | approved | rejected
    pub search: Option<&'r str>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
pub struct RejectBody {
    pub note: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateListingBody {
    pub name: Option<String>,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
    pub github_url: Option<String>,
    pub docs_url: Option<String>,
    pub api_endpoint_url: Option<String>,
    pub contact_email: Option<String>,
    pub is_featured: Option<bool>,
    pub status: Option<String>,
    pub rejection_note: Option<String>,
    /// Replace all category associations (list of category UUIDs)
    pub categories: Option<Vec<String>>,
    /// Replace all tag associations (list of tag names — upserted)
    pub tags: Option<Vec<String>>,
    /// Replace all chain associations (list of chain UUIDs)
    pub chains: Option<Vec<String>>,
}

#[derive(Deserialize)]
pub struct CreateCategoryBody {
    pub name: String,
}

#[derive(Deserialize)]
pub struct CreateChainBody {
    pub name: String,
    #[serde(default)]
    pub is_featured: bool,
}

// ---------------------------------------------------------------------------
// Stats response
// ---------------------------------------------------------------------------

#[derive(Serialize)]
pub struct TopListing {
    pub id: uuid::Uuid,
    pub name: String,
    pub slug: String,
    pub view_count: i32,
}

#[derive(Serialize)]
pub struct AdminStats {
    pub total: i64,
    pub approved: i64,
    pub pending: i64,
    pub rejected: i64,
    pub total_views: i64,
    pub top_listings: Vec<TopListing>,
}

// ---------------------------------------------------------------------------
// GET /api/admin/listings
// All listings at any status. Query: status, search, page, per_page.
// ---------------------------------------------------------------------------

#[get("/listings?<query..>")]
pub async fn admin_list_listings(
    pool: &State<DbPool>,
    query: AdminListingsQuery<'_>,
    _auth: AdminToken,
) -> Result<Json<PaginatedResponse<Listing>>, Custom<Json<ErrorBody>>> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * per_page;

    let mut where_clauses: Vec<String> = Vec::new();
    let mut binds: Vec<String> = Vec::new();
    let mut param_idx: i32 = 1;

    if let Some(status) = query.status {
        let s = status.trim();
        if !s.is_empty() {
            where_clauses.push(format!("status = ${}", param_idx));
            binds.push(s.to_string());
            param_idx += 1;
        }
    }

    if let Some(search) = query.search {
        let s = search.trim();
        if !s.is_empty() {
            where_clauses.push(format!(
                "(name ILIKE ${p} OR short_description ILIKE ${p} OR slug ILIKE ${p})",
                p = param_idx
            ));
            let escaped = s.replace('\\', "\\\\").replace('%', "\\%").replace('_', "\\_");
            binds.push(format!("%{}%", escaped));
            param_idx += 1;
        }
    }

    let where_sql = if where_clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", where_clauses.join(" AND "))
    };

    let count_sql = format!("SELECT COUNT(*) FROM listings {}", where_sql);
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql);
    for b in &binds {
        count_q = count_q.bind(b.clone());
    }
    let total: i64 = count_q
        .fetch_one(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    let limit_p = param_idx;
    let offset_p = param_idx + 1;
    let list_sql = format!(
        "SELECT id, name, slug, short_description, description, logo_url, website_url, \
         github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
         reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at \
         FROM listings {} ORDER BY submitted_at DESC LIMIT ${} OFFSET ${}",
        where_sql, limit_p, offset_p
    );

    let mut list_q = sqlx::query_as::<_, Listing>(&list_sql);
    for b in &binds {
        list_q = list_q.bind(b.clone());
    }
    list_q = list_q.bind(per_page).bind(offset);

    let rows: Vec<Listing> = list_q
        .fetch_all(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    let total_pages = if per_page > 0 {
        (total + per_page - 1) / per_page
    } else {
        0
    };

    Ok(Json(PaginatedResponse {
        data: rows,
        meta: PaginationMeta {
            page,
            per_page,
            total,
            total_pages,
        },
    }))
}

// ---------------------------------------------------------------------------
// GET /api/admin/listings/:id
// Full listing including contact_email and rejection_note, plus related data.
// ---------------------------------------------------------------------------

#[get("/listings/<id>")]
pub async fn admin_get_listing(
    pool: &State<DbPool>,
    id: &str,
    _auth: AdminToken,
) -> Result<Json<AdminListingDetail>, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    let listing = sqlx::query_as::<_, Listing>(
        "SELECT id, name, slug, short_description, description, logo_url, website_url, \
         github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
         reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at \
         FROM listings WHERE id = $1",
    )
    .bind(listing_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?
    .ok_or_else(|| AppError::NotFound.into_response())?;

    let categories = crate::routes::listings::fetch_categories(pool.inner(), listing_id)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;
    let tags = crate::routes::listings::fetch_tags(pool.inner(), listing_id)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;
    let chains = crate::routes::listings::fetch_chains(pool.inner(), listing_id)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(AdminListingDetail {
        listing,
        categories,
        tags,
        chains,
    }))
}

// ---------------------------------------------------------------------------
// POST /api/admin/listings/:id/approve
// Sets status=approved, approved_at=now(), increments category/tag listing_counts.
// ---------------------------------------------------------------------------

#[post("/listings/<id>/approve")]
pub async fn admin_approve_listing(
    pool: &State<DbPool>,
    id: &str,
    _auth: AdminToken,
) -> Result<Json<Listing>, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    // Atomic: only update if not already approved, returns None if already approved or not found
    let updated = sqlx::query_as::<_, Listing>(
        "UPDATE listings SET status = 'approved', approved_at = now(), updated_at = now() \
         WHERE id = $1 AND status != 'approved' \
         RETURNING id, name, slug, short_description, description, logo_url, website_url, \
         github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
         reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at",
    )
    .bind(listing_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    let updated = match updated {
        Some(listing) => listing,
        None => {
            // Either not found or already approved — fetch to distinguish
            return sqlx::query_as::<_, Listing>(
                "SELECT id, name, slug, short_description, description, logo_url, website_url, \
                 github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
                 reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at \
                 FROM listings WHERE id = $1",
            )
            .bind(listing_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?
            .map(Json)
            .ok_or_else(|| AppError::NotFound.into_response());
        }
    };

    // Increment counts — only runs once per approval due to WHERE status != 'approved'
    if let Err(e) = sqlx::query(
        "UPDATE categories SET listing_count = listing_count + 1 \
         WHERE id IN (SELECT category_id FROM listing_categories WHERE listing_id = $1)",
    )
    .bind(listing_id)
    .execute(pool.inner())
    .await {
        tracing::error!("Failed to increment category counts for listing {}: {}", listing_id, e);
    }

    if let Err(e) = sqlx::query(
        "UPDATE tags SET listing_count = listing_count + 1 \
         WHERE id IN (SELECT tag_id FROM listing_tags WHERE listing_id = $1)",
    )
    .bind(listing_id)
    .execute(pool.inner())
    .await {
        tracing::error!("Failed to increment tag counts for listing {}: {}", listing_id, e);
    }

    Ok(Json(updated))
}

// ---------------------------------------------------------------------------
// POST /api/admin/listings/:id/reject
// Sets status=rejected, stores optional rejection_note.
// ---------------------------------------------------------------------------

#[post("/listings/<id>/reject", data = "<body>")]
pub async fn admin_reject_listing(
    pool: &State<DbPool>,
    id: &str,
    body: Json<RejectBody>,
    _auth: AdminToken,
) -> Result<Json<Listing>, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    let note = body.into_inner().note;

    // Atomic: capture old status and update in one shot
    // Returns the old status alongside the updated row
    let was_approved: bool = sqlx::query_scalar::<_, bool>(
        "SELECT status = 'approved' FROM listings WHERE id = $1",
    )
    .bind(listing_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?
    .ok_or_else(|| AppError::NotFound.into_response())?;

    let updated = sqlx::query_as::<_, Listing>(
        "UPDATE listings SET status = 'rejected', rejection_note = $2, updated_at = now() \
         WHERE id = $1 AND status != 'rejected' \
         RETURNING id, name, slug, short_description, description, logo_url, website_url, \
         github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
         reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at",
    )
    .bind(listing_id)
    .bind(note)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    let updated = match updated {
        Some(listing) => listing,
        None => {
            // Already rejected — just return current state
            return sqlx::query_as::<_, Listing>(
                "SELECT id, name, slug, short_description, description, logo_url, website_url, \
                 github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
                 reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at \
                 FROM listings WHERE id = $1",
            )
            .bind(listing_id)
            .fetch_optional(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?
            .map(Json)
            .ok_or_else(|| AppError::NotFound.into_response());
        }
    };

    // Decrement counts only if was approved before this rejection
    if was_approved {
        if let Err(e) = sqlx::query(
            "UPDATE categories SET listing_count = GREATEST(listing_count - 1, 0) \
             WHERE id IN (SELECT category_id FROM listing_categories WHERE listing_id = $1)",
        )
        .bind(listing_id)
        .execute(pool.inner())
        .await {
            tracing::error!("Failed to decrement category counts for listing {}: {}", listing_id, e);
        }

        if let Err(e) = sqlx::query(
            "UPDATE tags SET listing_count = GREATEST(listing_count - 1, 0) \
             WHERE id IN (SELECT tag_id FROM listing_tags WHERE listing_id = $1)",
        )
        .bind(listing_id)
        .execute(pool.inner())
        .await {
            tracing::error!("Failed to decrement tag counts for listing {}: {}", listing_id, e);
        }
    }

    Ok(Json(updated))
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/listings/:id
// Partial update — only supplied (non-None) fields are changed.
// ---------------------------------------------------------------------------

#[patch("/listings/<id>", data = "<body>")]
pub async fn admin_update_listing(
    pool: &State<DbPool>,
    id: &str,
    body: Json<UpdateListingBody>,
    _auth: AdminToken,
) -> Result<Json<AdminListingDetail>, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    let upd = body.into_inner();

    // Build SET clauses dynamically from non-None fields
    let mut set_clauses: Vec<String> = Vec::new();
    let mut string_binds: Vec<Option<String>> = Vec::new();
    let mut param_idx: i32 = 1;

    macro_rules! add_field {
        ($field:expr, $col:expr) => {
            if let Some(val) = $field {
                set_clauses.push(format!("{} = ${}", $col, param_idx));
                string_binds.push(Some(val));
                param_idx += 1;
            }
        };
    }

    // Block status changes via PATCH — use /approve or /reject endpoints instead
    if upd.status.is_some() {
        return Err(AppError::Validation(
            "Cannot change status via PATCH. Use /approve or /reject endpoints.".to_string(),
        )
        .into_response());
    }

    // --- Validate fields if provided ---
    if let Some(ref name) = upd.name {
        let n = name.trim();
        if n.is_empty() || n.len() > 100 {
            return Err(AppError::Validation("name must be 1-100 characters".to_string()).into_response());
        }
    }
    if let Some(ref sd) = upd.short_description {
        let s = sd.trim();
        if s.is_empty() || s.len() > 140 {
            return Err(AppError::Validation("short_description must be 1-140 characters".to_string()).into_response());
        }
    }
    if let Some(ref desc) = upd.description {
        let d = desc.trim();
        if d.len() < 10 {
            return Err(AppError::Validation("description must be at least 10 characters".to_string()).into_response());
        }
        if d.len() > 10_000 {
            return Err(AppError::Validation("description must be at most 10,000 characters".to_string()).into_response());
        }
    }
    if let Some(ref url) = upd.website_url {
        if !url.starts_with("https://") {
            return Err(AppError::Validation("website_url must start with https://".to_string()).into_response());
        }
    }
    if let Some(ref gh) = upd.github_url {
        if !gh.is_empty() && !gh.starts_with("https://github.com/") {
            return Err(AppError::Validation("github_url must start with https://github.com/".to_string()).into_response());
        }
    }
    for (field_name, field_val) in [
        ("logo_url", &upd.logo_url),
        ("docs_url", &upd.docs_url),
        ("api_endpoint_url", &upd.api_endpoint_url),
    ] {
        if let Some(ref url) = field_val {
            if !url.is_empty() && !url.starts_with("https://") && !url.starts_with("http://") {
                return Err(AppError::Validation(format!("{} must start with https:// or http://", field_name)).into_response());
            }
        }
    }
    if let Some(ref email) = upd.contact_email {
        let e = email.trim();
        if !e.contains('@') || !e.contains('.') {
            return Err(AppError::Validation("contact_email must be a valid email address".to_string()).into_response());
        }
    }

    add_field!(upd.name, "name");
    add_field!(upd.short_description, "short_description");
    add_field!(upd.description, "description");
    add_field!(upd.logo_url, "logo_url");
    add_field!(upd.website_url, "website_url");
    add_field!(upd.github_url, "github_url");
    add_field!(upd.docs_url, "docs_url");
    add_field!(upd.api_endpoint_url, "api_endpoint_url");
    add_field!(upd.contact_email, "contact_email");
    add_field!(upd.rejection_note, "rejection_note");

    if let Some(featured) = upd.is_featured {
        set_clauses.push(format!("is_featured = ${}::boolean", param_idx));
        string_binds.push(Some(featured.to_string()));
        param_idx += 1;
    }

    let has_scalar_changes = !set_clauses.is_empty();
    let has_relation_changes = upd.categories.is_some() || upd.tags.is_some() || upd.chains.is_some();

    // Update scalar fields if any
    let listing = if has_scalar_changes {
        set_clauses.push("updated_at = now()".to_string());

        let update_sql = format!(
            "UPDATE listings SET {} WHERE id = ${} \
             RETURNING id, name, slug, short_description, description, logo_url, website_url, \
             github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
             reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at",
            set_clauses.join(", "),
            param_idx
        );

        let mut q = sqlx::query_as::<_, Listing>(&update_sql);
        for bind_val in string_binds {
            q = q.bind(bind_val);
        }
        q = q.bind(listing_id);

        q.fetch_optional(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?
            .ok_or_else(|| AppError::NotFound.into_response())?
    } else if has_relation_changes {
        // Touch updated_at even if only relations changed
        sqlx::query_as::<_, Listing>(
            "UPDATE listings SET updated_at = now() WHERE id = $1 \
             RETURNING id, name, slug, short_description, description, logo_url, website_url, \
             github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
             reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at",
        )
        .bind(listing_id)
        .fetch_optional(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?
        .ok_or_else(|| AppError::NotFound.into_response())?
    } else {
        // Nothing to update at all
        sqlx::query_as::<_, Listing>(
            "SELECT id, name, slug, short_description, description, logo_url, website_url, \
             github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
             reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at \
             FROM listings WHERE id = $1",
        )
        .bind(listing_id)
        .fetch_optional(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?
        .ok_or_else(|| AppError::NotFound.into_response())?
    };

    // --- Replace categories if provided ---
    if let Some(cat_ids) = upd.categories {
        sqlx::query("DELETE FROM listing_categories WHERE listing_id = $1")
            .bind(listing_id)
            .execute(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

        for cat_id_str in &cat_ids {
            let cat_id = uuid::Uuid::parse_str(cat_id_str)
                .map_err(|_| AppError::Validation(format!("invalid category id: {}", cat_id_str)).into_response())?;
            let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)")
                .bind(cat_id)
                .fetch_one(pool.inner())
                .await
                .map_err(|e| AppError::Db(e).into_response())?;
            if !exists {
                return Err(AppError::Validation(format!("category {} does not exist", cat_id_str)).into_response());
            }
            sqlx::query("INSERT INTO listing_categories (listing_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(listing_id)
                .bind(cat_id)
                .execute(pool.inner())
                .await
                .map_err(|e| AppError::Db(e).into_response())?;
        }
    }

    // --- Replace tags if provided (upsert by name) ---
    if let Some(tag_names) = upd.tags {
        sqlx::query("DELETE FROM listing_tags WHERE listing_id = $1")
            .bind(listing_id)
            .execute(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

        static TAG_RE: std::sync::LazyLock<regex::Regex> = std::sync::LazyLock::new(|| {
            regex::Regex::new(r"^[a-z0-9][a-z0-9-]{0,59}$").expect("valid regex")
        });
        for tag_name_raw in &tag_names {
            let tag_name = tag_name_raw.trim().to_lowercase();
            if tag_name.is_empty() || tag_name.len() > 60 {
                return Err(AppError::Validation(format!("tag '{}' must be 1-60 characters", tag_name_raw)).into_response());
            }
            if !TAG_RE.is_match(&tag_name) {
                return Err(AppError::Validation(format!("tag '{}' must be lowercase alphanumeric and hyphens only", tag_name_raw)).into_response());
            }
            let tag_slug = slug::slugify(&tag_name);
            let tag_id: uuid::Uuid = sqlx::query_scalar(
                "INSERT INTO tags (id, name, slug) VALUES (gen_random_uuid(), $1, $2) \
                 ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name \
                 RETURNING id",
            )
            .bind(&tag_name)
            .bind(&tag_slug)
            .fetch_one(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

            sqlx::query("INSERT INTO listing_tags (listing_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(listing_id)
                .bind(tag_id)
                .execute(pool.inner())
                .await
                .map_err(|e| AppError::Db(e).into_response())?;
        }
    }

    // --- Replace chains if provided ---
    if let Some(chain_ids) = upd.chains {
        sqlx::query("DELETE FROM listing_chains WHERE listing_id = $1")
            .bind(listing_id)
            .execute(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

        for chain_id_str in &chain_ids {
            let chain_id = uuid::Uuid::parse_str(chain_id_str)
                .map_err(|_| AppError::Validation(format!("invalid chain id: {}", chain_id_str)).into_response())?;
            let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM chain_support WHERE id = $1)")
                .bind(chain_id)
                .fetch_one(pool.inner())
                .await
                .map_err(|e| AppError::Db(e).into_response())?;
            if !exists {
                return Err(AppError::Validation(format!("chain {} does not exist", chain_id_str)).into_response());
            }
            sqlx::query("INSERT INTO listing_chains (listing_id, chain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(listing_id)
                .bind(chain_id)
                .execute(pool.inner())
                .await
                .map_err(|e| AppError::Db(e).into_response())?;
        }
    }

    // Fetch fresh relations and return full detail
    let categories = crate::routes::listings::fetch_categories(pool.inner(), listing_id)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;
    let tags = crate::routes::listings::fetch_tags(pool.inner(), listing_id)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;
    let chains = crate::routes::listings::fetch_chains(pool.inner(), listing_id)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(AdminListingDetail {
        listing,
        categories,
        tags,
        chains,
    }))
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/listings/:id
// Hard delete. Returns 204 No Content on success, 404 if not found.
// ---------------------------------------------------------------------------

#[delete("/listings/<id>")]
pub async fn admin_delete_listing(
    pool: &State<DbPool>,
    id: &str,
    _auth: AdminToken,
) -> Result<rocket::http::Status, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    // Fetch status and related IDs before deleting (CASCADE will remove join rows)
    let was_approved: bool = sqlx::query_scalar::<_, bool>(
        "SELECT status = 'approved' FROM listings WHERE id = $1",
    )
    .bind(listing_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?
    .ok_or_else(|| AppError::NotFound.into_response())?;

    // Decrement counts BEFORE delete (since CASCADE removes join rows)
    if was_approved {
        if let Err(e) = sqlx::query(
            "UPDATE categories SET listing_count = GREATEST(listing_count - 1, 0) \
             WHERE id IN (SELECT category_id FROM listing_categories WHERE listing_id = $1)",
        )
        .bind(listing_id)
        .execute(pool.inner())
        .await {
            tracing::error!("Failed to decrement category counts for listing {}: {}", listing_id, e);
        }

        if let Err(e) = sqlx::query(
            "UPDATE tags SET listing_count = GREATEST(listing_count - 1, 0) \
             WHERE id IN (SELECT tag_id FROM listing_tags WHERE listing_id = $1)",
        )
        .bind(listing_id)
        .execute(pool.inner())
        .await {
            tracing::error!("Failed to decrement tag counts for listing {}: {}", listing_id, e);
        }
    }

    let result = sqlx::query("DELETE FROM listings WHERE id = $1")
        .bind(listing_id)
        .execute(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound.into_response());
    }

    Ok(rocket::http::Status::NoContent)
}

// ---------------------------------------------------------------------------
// GET /api/admin/stats
// Returns aggregate counts and top 5 listings by view count.
// ---------------------------------------------------------------------------

#[get("/stats")]
pub async fn admin_get_stats(
    pool: &State<DbPool>,
    _auth: AdminToken,
) -> Result<Json<AdminStats>, Custom<Json<ErrorBody>>> {
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM listings")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    let approved: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM listings WHERE status = 'approved'")
            .fetch_one(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

    let pending: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM listings WHERE status = 'pending'")
            .fetch_one(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

    let rejected: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM listings WHERE status = 'rejected'")
            .fetch_one(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

    let total_views: i64 =
        sqlx::query_scalar("SELECT COALESCE(SUM(view_count), 0) FROM listings")
            .fetch_one(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?;

    // Top 5 listings by view count
    #[derive(sqlx::FromRow)]
    struct TopRow {
        id: uuid::Uuid,
        name: String,
        slug: String,
        view_count: i32,
    }

    let top_rows: Vec<TopRow> = sqlx::query_as::<_, TopRow>(
        "SELECT id, name, slug, view_count FROM listings ORDER BY view_count DESC LIMIT 5",
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    let top_listings = top_rows
        .into_iter()
        .map(|r| TopListing {
            id: r.id,
            name: r.name,
            slug: r.slug,
            view_count: r.view_count,
        })
        .collect();

    Ok(Json(AdminStats {
        total,
        approved,
        pending,
        rejected,
        total_views,
        top_listings,
    }))
}

// ---------------------------------------------------------------------------
// POST /api/admin/categories
// Create a new category. Returns the created category.
// ---------------------------------------------------------------------------

#[post("/categories", data = "<body>")]
pub async fn admin_create_category(
    pool: &State<DbPool>,
    body: Json<CreateCategoryBody>,
    _auth: AdminToken,
) -> Result<Json<CategoryRef>, Custom<Json<ErrorBody>>> {
    let name = body.into_inner().name.trim().to_string();
    if name.is_empty() || name.len() > 100 {
        return Err(AppError::Validation("category name must be 1-100 characters".to_string()).into_response());
    }
    let cat_slug = slug::slugify(&name);
    if cat_slug.is_empty() {
        return Err(AppError::Validation("category name must contain at least one alphanumeric character".to_string()).into_response());
    }

    let cat = sqlx::query_as::<_, CategoryRef>(
        "INSERT INTO categories (id, name, slug) VALUES (gen_random_uuid(), $1, $2) \
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name \
         RETURNING id, name, slug",
    )
    .bind(&name)
    .bind(&cat_slug)
    .fetch_one(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(cat))
}

// ---------------------------------------------------------------------------
// POST /api/admin/chains
// Create a new chain. Returns the created chain.
// ---------------------------------------------------------------------------

#[post("/chains", data = "<body>")]
pub async fn admin_create_chain(
    pool: &State<DbPool>,
    body: Json<CreateChainBody>,
    _auth: AdminToken,
) -> Result<Json<ChainRef>, Custom<Json<ErrorBody>>> {
    let inner = body.into_inner();
    let name = inner.name.trim().to_string();
    if name.is_empty() || name.len() > 100 {
        return Err(AppError::Validation("chain name must be 1-100 characters".to_string()).into_response());
    }
    let chain_slug = slug::slugify(&name);
    if chain_slug.is_empty() {
        return Err(AppError::Validation("chain name must contain at least one alphanumeric character".to_string()).into_response());
    }

    let chain = sqlx::query_as::<_, ChainRef>(
        "INSERT INTO chain_support (id, name, slug, is_featured) VALUES (gen_random_uuid(), $1, $2, $3) \
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name \
         RETURNING id, name, slug, is_featured",
    )
    .bind(&name)
    .bind(&chain_slug)
    .bind(inner.is_featured)
    .fetch_one(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(chain))
}

// ---------------------------------------------------------------------------
// POST /api/admin/listings/:id/toggle-featured
// Quick toggle for is_featured. Returns the updated listing.
// ---------------------------------------------------------------------------

#[post("/listings/<id>/toggle-featured")]
pub async fn admin_toggle_featured(
    pool: &State<DbPool>,
    id: &str,
    _auth: AdminToken,
) -> Result<Json<Listing>, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    let updated = sqlx::query_as::<_, Listing>(
        "UPDATE listings SET is_featured = NOT is_featured, updated_at = now() \
         WHERE id = $1 \
         RETURNING id, name, slug, short_description, description, logo_url, website_url, \
         github_url, docs_url, api_endpoint_url, contact_email, status, rejection_note, \
         reputation_score, is_featured, view_count, submitted_at, updated_at, approved_at",
    )
    .bind(listing_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?
    .ok_or_else(|| AppError::NotFound.into_response())?;

    Ok(Json(updated))
}

// ---------------------------------------------------------------------------
// GET /api/admin/chain-suggestions
// List all chain suggestions, optionally filtered by status.
// ---------------------------------------------------------------------------

#[derive(rocket::form::FromForm, Default)]
pub struct ChainSuggestionQuery<'r> {
    pub status: Option<&'r str>,
}

#[get("/chain-suggestions?<query..>")]
pub async fn admin_list_chain_suggestions(
    pool: &State<DbPool>,
    query: ChainSuggestionQuery<'_>,
    _auth: AdminToken,
) -> Result<Json<Vec<ChainSuggestion>>, Custom<Json<ErrorBody>>> {
    let rows = if let Some(status) = query.status {
        let s = status.trim();
        if !s.is_empty() {
            sqlx::query_as::<_, ChainSuggestion>(
                "SELECT id, name, listing_id, status, created_at, reviewed_at \
                 FROM chain_suggestions WHERE status = $1 ORDER BY created_at DESC"
            )
            .bind(s)
            .fetch_all(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?
        } else {
            sqlx::query_as::<_, ChainSuggestion>(
                "SELECT id, name, listing_id, status, created_at, reviewed_at \
                 FROM chain_suggestions ORDER BY created_at DESC"
            )
            .fetch_all(pool.inner())
            .await
            .map_err(|e| AppError::Db(e).into_response())?
        }
    } else {
        sqlx::query_as::<_, ChainSuggestion>(
            "SELECT id, name, listing_id, status, created_at, reviewed_at \
             FROM chain_suggestions ORDER BY created_at DESC"
        )
        .fetch_all(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?
    };

    Ok(Json(rows))
}

// ---------------------------------------------------------------------------
// POST /api/admin/chain-suggestions/:id/approve
// Approve a chain suggestion: creates a chain_support entry, links it to the
// listing, and marks the suggestion as approved.
// ---------------------------------------------------------------------------

#[post("/chain-suggestions/<id>/approve")]
pub async fn admin_approve_chain_suggestion(
    pool: &State<DbPool>,
    id: &str,
    _auth: AdminToken,
) -> Result<Json<ChainRef>, Custom<Json<ErrorBody>>> {
    let suggestion_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid suggestion id".to_string()).into_response())?;

    // Fetch the suggestion
    let suggestion = sqlx::query_as::<_, ChainSuggestion>(
        "SELECT id, name, listing_id, status, created_at, reviewed_at \
         FROM chain_suggestions WHERE id = $1"
    )
    .bind(suggestion_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?
    .ok_or_else(|| AppError::NotFound.into_response())?;

    if suggestion.status != "pending" {
        return Err(AppError::Validation("suggestion already reviewed".to_string()).into_response());
    }

    // Create the chain (upsert by slug)
    let chain_slug = slug::slugify(&suggestion.name);
    let chain = sqlx::query_as::<_, ChainRef>(
        "INSERT INTO chain_support (id, name, slug, is_featured) VALUES (gen_random_uuid(), $1, $2, false) \
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name \
         RETURNING id, name, slug, is_featured"
    )
    .bind(&suggestion.name)
    .bind(&chain_slug)
    .fetch_one(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    // Link chain to the listing
    sqlx::query("INSERT INTO listing_chains (listing_id, chain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
        .bind(suggestion.listing_id)
        .bind(chain.id)
        .execute(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    // Mark suggestion as approved
    sqlx::query("UPDATE chain_suggestions SET status = 'approved', reviewed_at = now() WHERE id = $1")
        .bind(suggestion_id)
        .execute(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(chain))
}

// ---------------------------------------------------------------------------
// POST /api/admin/chain-suggestions/:id/reject
// Mark a chain suggestion as rejected.
// ---------------------------------------------------------------------------

#[post("/chain-suggestions/<id>/reject")]
pub async fn admin_reject_chain_suggestion(
    pool: &State<DbPool>,
    id: &str,
    _auth: AdminToken,
) -> Result<rocket::http::Status, Custom<Json<ErrorBody>>> {
    let suggestion_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid suggestion id".to_string()).into_response())?;

    let result = sqlx::query(
        "UPDATE chain_suggestions SET status = 'rejected', reviewed_at = now() \
         WHERE id = $1 AND status = 'pending'"
    )
    .bind(suggestion_id)
    .execute(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound.into_response());
    }

    Ok(rocket::http::Status::NoContent)
}
