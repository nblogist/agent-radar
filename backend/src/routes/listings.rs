use std::collections::HashMap;

use rocket::response::status::Custom;
use rocket::serde::json::Json;
use rocket::State;
use serde::Serialize;

use crate::db::DbPool;
use crate::errors::{AppError, ErrorBody};
use crate::guards::admin_token::AdminToken;
use crate::guards::rate_limit::ReadRateLimit;
use crate::guards::rate_limit::SubmitRateLimit;
use crate::models::listing::{CategoryRef, ChainRef, Listing, NewListing, PublicListing, TagRef};

// ---------------------------------------------------------------------------
// Pagination helpers
// ---------------------------------------------------------------------------

#[derive(Serialize)]
pub struct PaginationMeta {
    pub page: i64,
    pub per_page: i64,
    pub total: i64,
    pub total_pages: i64,
}

#[derive(Serialize)]
pub struct PaginatedResponse<T: Serialize> {
    pub data: Vec<T>,
    pub meta: PaginationMeta,
}

// ---------------------------------------------------------------------------
// Query parameters
// ---------------------------------------------------------------------------

#[derive(rocket::form::FromForm, Default)]
pub struct ListingsQuery<'r> {
    pub search: Option<&'r str>,
    pub category: Option<&'r str>,
    pub tag: Option<&'r str>,
    pub chain: Option<&'r str>,
    pub sort: Option<&'r str>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

// ---------------------------------------------------------------------------
// Helper: fetch associated data for a listing id
// ---------------------------------------------------------------------------

pub async fn fetch_categories(pool: &DbPool, listing_id: uuid::Uuid) -> Result<Vec<CategoryRef>, sqlx::Error> {
    sqlx::query_as::<_, CategoryRef>(
        "SELECT c.id, c.name, c.slug FROM categories c \
         INNER JOIN listing_categories lc ON lc.category_id = c.id \
         WHERE lc.listing_id = $1 \
         ORDER BY c.name ASC"
    )
    .bind(listing_id)
    .fetch_all(pool)
    .await
}

pub async fn fetch_tags(pool: &DbPool, listing_id: uuid::Uuid) -> Result<Vec<TagRef>, sqlx::Error> {
    sqlx::query_as::<_, TagRef>(
        "SELECT t.id, t.name, t.slug FROM tags t \
         INNER JOIN listing_tags lt ON lt.tag_id = t.id \
         WHERE lt.listing_id = $1 \
         ORDER BY t.name ASC"
    )
    .bind(listing_id)
    .fetch_all(pool)
    .await
}

pub async fn fetch_chains(pool: &DbPool, listing_id: uuid::Uuid) -> Result<Vec<ChainRef>, sqlx::Error> {
    sqlx::query_as::<_, ChainRef>(
        "SELECT cs.id, cs.name, cs.slug, cs.is_featured FROM chain_support cs \
         INNER JOIN listing_chains lch ON lch.chain_id = cs.id \
         WHERE lch.listing_id = $1 \
         ORDER BY cs.is_featured DESC, cs.name ASC"
    )
    .bind(listing_id)
    .fetch_all(pool)
    .await
}

// ---------------------------------------------------------------------------
// Batch helpers: fetch associated data for multiple listings in one query each
// ---------------------------------------------------------------------------

#[derive(sqlx::FromRow)]
struct CategoryRefWithListing {
    listing_id: uuid::Uuid,
    id: uuid::Uuid,
    name: String,
    slug: String,
}

#[derive(sqlx::FromRow)]
struct TagRefWithListing {
    listing_id: uuid::Uuid,
    id: uuid::Uuid,
    name: String,
    slug: String,
}

#[derive(sqlx::FromRow)]
struct ChainRefWithListing {
    listing_id: uuid::Uuid,
    id: uuid::Uuid,
    name: String,
    slug: String,
    is_featured: bool,
}

async fn fetch_categories_batch(pool: &DbPool, ids: &[uuid::Uuid]) -> Result<HashMap<uuid::Uuid, Vec<CategoryRef>>, sqlx::Error> {
    let rows = sqlx::query_as::<_, CategoryRefWithListing>(
        "SELECT lc.listing_id, c.id, c.name, c.slug FROM categories c \
         INNER JOIN listing_categories lc ON lc.category_id = c.id \
         WHERE lc.listing_id = ANY($1) \
         ORDER BY c.name ASC"
    )
    .bind(ids)
    .fetch_all(pool)
    .await?;

    let mut map: HashMap<uuid::Uuid, Vec<CategoryRef>> = HashMap::new();
    for r in rows {
        map.entry(r.listing_id).or_default().push(CategoryRef { id: r.id, name: r.name, slug: r.slug });
    }
    Ok(map)
}

async fn fetch_tags_batch(pool: &DbPool, ids: &[uuid::Uuid]) -> Result<HashMap<uuid::Uuid, Vec<TagRef>>, sqlx::Error> {
    let rows = sqlx::query_as::<_, TagRefWithListing>(
        "SELECT lt.listing_id, t.id, t.name, t.slug FROM tags t \
         INNER JOIN listing_tags lt ON lt.tag_id = t.id \
         WHERE lt.listing_id = ANY($1) \
         ORDER BY t.name ASC"
    )
    .bind(ids)
    .fetch_all(pool)
    .await?;

    let mut map: HashMap<uuid::Uuid, Vec<TagRef>> = HashMap::new();
    for r in rows {
        map.entry(r.listing_id).or_default().push(TagRef { id: r.id, name: r.name, slug: r.slug });
    }
    Ok(map)
}

async fn fetch_chains_batch(pool: &DbPool, ids: &[uuid::Uuid]) -> Result<HashMap<uuid::Uuid, Vec<ChainRef>>, sqlx::Error> {
    let rows = sqlx::query_as::<_, ChainRefWithListing>(
        "SELECT lch.listing_id, cs.id, cs.name, cs.slug, cs.is_featured FROM chain_support cs \
         INNER JOIN listing_chains lch ON lch.chain_id = cs.id \
         WHERE lch.listing_id = ANY($1) \
         ORDER BY cs.is_featured DESC, cs.name ASC"
    )
    .bind(ids)
    .fetch_all(pool)
    .await?;

    let mut map: HashMap<uuid::Uuid, Vec<ChainRef>> = HashMap::new();
    for r in rows {
        map.entry(r.listing_id).or_default().push(ChainRef { id: r.id, name: r.name, slug: r.slug, is_featured: r.is_featured });
    }
    Ok(map)
}

fn build_public_listings_batch(
    rows: Vec<Listing>,
    mut cats: HashMap<uuid::Uuid, Vec<CategoryRef>>,
    mut tags: HashMap<uuid::Uuid, Vec<TagRef>>,
    mut chains: HashMap<uuid::Uuid, Vec<ChainRef>>,
) -> Vec<PublicListing> {
    rows.into_iter().map(|row| {
        let id = row.id;
        PublicListing {
            id: row.id,
            name: row.name,
            slug: row.slug,
            short_description: row.short_description,
            description: row.description,
            logo_url: row.logo_url,
            website_url: row.website_url,
            github_url: row.github_url,
            docs_url: row.docs_url,
            api_endpoint_url: row.api_endpoint_url,
            reputation_score: row.reputation_score,
            is_featured: row.is_featured,
            view_count: row.view_count,
            submitted_at: row.submitted_at,
            updated_at: row.updated_at,
            approved_at: row.approved_at,
            categories: cats.remove(&id).unwrap_or_default(),
            tags: tags.remove(&id).unwrap_or_default(),
            chains: chains.remove(&id).unwrap_or_default(),
        }
    }).collect()
}

async fn build_public_listing(pool: &DbPool, row: Listing) -> Result<PublicListing, sqlx::Error> {
    let categories = fetch_categories(pool, row.id).await?;
    let tags = fetch_tags(pool, row.id).await?;
    let chains = fetch_chains(pool, row.id).await?;
    Ok(PublicListing {
        id: row.id,
        name: row.name,
        slug: row.slug,
        short_description: row.short_description,
        description: row.description,
        logo_url: row.logo_url,
        website_url: row.website_url,
        github_url: row.github_url,
        docs_url: row.docs_url,
        api_endpoint_url: row.api_endpoint_url,
        reputation_score: row.reputation_score,
        is_featured: row.is_featured,
        view_count: row.view_count,
        submitted_at: row.submitted_at,
        updated_at: row.updated_at,
        approved_at: row.approved_at,
        categories,
        tags,
        chains,
    })
}

// ---------------------------------------------------------------------------
// GET /api/listings — paginated, filterable, sortable
// ---------------------------------------------------------------------------

#[get("/listings?<query..>")]
pub async fn list_listings(
    pool: &State<DbPool>,
    query: ListingsQuery<'_>,
    _rl: ReadRateLimit,
) -> Result<Json<PaginatedResponse<PublicListing>>, Custom<Json<ErrorBody>>> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * per_page;

    // Build the WHERE clause and join clauses dynamically.
    // We accumulate bind parameters in a Vec<String> and track parameter index.
    let mut param_idx: i32 = 1;
    let mut where_clauses: Vec<String> = vec!["l.status = 'approved'".to_string()];
    let mut join_clauses: Vec<String> = Vec::new();

    // Bind values — we store everything as String and bind them at the end.
    // To avoid dynamic typing, we use a different approach: build the SQL string
    // and pass a Vec<Option<String>> of bound values.
    let mut binds: Vec<String> = Vec::new();

    // Category filter
    if let Some(cat_slug) = query.category {
        if !cat_slug.trim().is_empty() {
            join_clauses.push(format!(
                "INNER JOIN listing_categories _lc ON _lc.listing_id = l.id \
                 INNER JOIN categories _c ON _c.id = _lc.category_id AND _c.slug = ${p}",
                p = param_idx
            ));
            binds.push(cat_slug.to_string());
            param_idx += 1;
        }
    }

    // Tag filter
    if let Some(tag_slug) = query.tag {
        if !tag_slug.trim().is_empty() {
            join_clauses.push(format!(
                "INNER JOIN listing_tags _lt ON _lt.listing_id = l.id \
                 INNER JOIN tags _t ON _t.id = _lt.tag_id AND _t.slug = ${p}",
                p = param_idx
            ));
            binds.push(tag_slug.to_string());
            param_idx += 1;
        }
    }

    // Chain filter
    if let Some(chain_slug) = query.chain {
        if !chain_slug.trim().is_empty() {
            join_clauses.push(format!(
                "INNER JOIN listing_chains _lch ON _lch.listing_id = l.id \
                 INNER JOIN chain_support _cs ON _cs.id = _lch.chain_id AND _cs.slug = ${p}",
                p = param_idx
            ));
            binds.push(chain_slug.to_string());
            param_idx += 1;
        }
    }

    // Search filter
    let search_bind: Option<String>;
    if let Some(search) = query.search {
        let trimmed = search.trim();
        if !trimmed.is_empty() {
            // Escape ILIKE wildcards to prevent wildcard injection
            let escaped = trimmed.replace('\\', "\\\\").replace('%', "\\%").replace('_', "\\_");
            let like_val = format!("%{}%", escaped);
            where_clauses.push(format!(
                "(l.name ILIKE ${p} OR l.description ILIKE ${p})",
                p = param_idx
            ));
            search_bind = Some(like_val.clone());
            binds.push(like_val);
            param_idx += 1;
        } else {
            search_bind = None;
        }
    } else {
        search_bind = None;
    }
    let _ = search_bind; // suppress unused warning

    // ORDER BY
    let order_by = match query.sort.unwrap_or("newest") {
        "views" => "l.view_count DESC",
        "alpha" => "l.name ASC",
        _ => "l.approved_at DESC NULLS LAST",
    };

    let joins_sql = join_clauses.join(" ");
    let where_sql = format!("WHERE {}", where_clauses.join(" AND "));

    // COUNT query
    let count_sql = format!(
        "SELECT COUNT(DISTINCT l.id) FROM listings l {} {}",
        joins_sql, where_sql
    );

    // Listings query with LIMIT/OFFSET (param_idx is already beyond filter params)
    let limit_p = param_idx;
    let offset_p = param_idx + 1;
    let list_sql = format!(
        "SELECT DISTINCT l.id, l.name, l.slug, l.short_description, l.description, \
         l.logo_url, l.website_url, l.github_url, l.docs_url, l.api_endpoint_url, \
         l.contact_email, l.status, l.rejection_note, l.reputation_score, l.is_featured, l.view_count, \
         l.submitted_at, l.updated_at, l.approved_at \
         FROM listings l {} {} \
         ORDER BY {} \
         LIMIT ${} OFFSET ${}",
        joins_sql, where_sql, order_by, limit_p, offset_p
    );

    // Build and execute the COUNT query
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql);
    for b in &binds {
        count_q = count_q.bind(b.clone());
    }
    let total: i64 = count_q
        .fetch_one(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    // Build and execute the listings query
    let mut list_q = sqlx::query_as::<_, Listing>(&list_sql);
    for b in &binds {
        list_q = list_q.bind(b.clone());
    }
    list_q = list_q.bind(per_page).bind(offset);

    let rows: Vec<Listing> = list_q
        .fetch_all(pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    // Batch-load all associations in 3 queries (instead of 3 per listing)
    let ids: Vec<uuid::Uuid> = rows.iter().map(|r| r.id).collect();
    let cats = fetch_categories_batch(pool.inner(), &ids)
        .await.map_err(|e| AppError::Db(e).into_response())?;
    let tags = fetch_tags_batch(pool.inner(), &ids)
        .await.map_err(|e| AppError::Db(e).into_response())?;
    let chains = fetch_chains_batch(pool.inner(), &ids)
        .await.map_err(|e| AppError::Db(e).into_response())?;
    let data = build_public_listings_batch(rows, cats, tags, chains);

    let total_pages = if per_page > 0 {
        (total + per_page - 1) / per_page
    } else {
        0
    };

    Ok(Json(PaginatedResponse {
        data,
        meta: PaginationMeta { page, per_page, total, total_pages },
    }))
}

// ---------------------------------------------------------------------------
// GET /api/listings/<slug> — detail with atomic view increment
// ---------------------------------------------------------------------------

#[get("/listings/<slug>")]
pub async fn get_listing(
    pool: &State<DbPool>,
    slug: &str,
    _rl: ReadRateLimit,
) -> Result<Json<PublicListing>, Custom<Json<ErrorBody>>> {
    // Atomically increment view_count and return the updated row.
    // Only returns the listing if status = 'approved'.
    let row = sqlx::query_as::<_, Listing>(
        "UPDATE listings SET view_count = view_count + 1 \
         WHERE slug = $1 AND status = 'approved' \
         RETURNING id, name, slug, short_description, description, \
                   logo_url, website_url, github_url, docs_url, api_endpoint_url, \
                   contact_email, status, rejection_note, reputation_score, is_featured, view_count, \
                   submitted_at, updated_at, approved_at"
    )
    .bind(slug)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    match row {
        None => Err(AppError::NotFound.into_response()),
        Some(listing) => {
            let pl = build_public_listing(pool.inner(), listing)
                .await
                .map_err(|e| AppError::Db(e).into_response())?;
            Ok(Json(pl))
        }
    }
}

// ---------------------------------------------------------------------------
// Response types for submit and reputation endpoints
// ---------------------------------------------------------------------------

#[derive(Serialize)]
pub struct SubmitResponse {
    pub id: uuid::Uuid,
    pub slug: String,
    pub status: String,
    pub submitted_at: chrono::DateTime<chrono::Utc>,
}

#[derive(serde::Deserialize, Debug)]
pub struct ReputationPayload {
    pub score: f64,
}

#[derive(Serialize)]
pub struct ReputationResponse {
    pub id: uuid::Uuid,
    pub reputation_score: Option<f64>,
    pub message: String,
}

// ---------------------------------------------------------------------------
// POST /api/listings — public submission with validation and rate limiting
// ---------------------------------------------------------------------------

#[post("/listings", data = "<body>")]
pub async fn submit_listing(
    pool: &State<DbPool>,
    body: Json<NewListing>,
    _rl: SubmitRateLimit,
) -> Result<rocket::response::status::Created<Json<SubmitResponse>>, Custom<Json<ErrorBody>>> {
    let payload = body.into_inner();

    // --- Validation ---
    let name = payload.name.trim().to_string();
    if name.is_empty() || name.len() > 100 {
        return Err(AppError::Validation("name must be 1-100 characters".to_string()).into_response());
    }
    let short_desc = payload.short_description.trim().to_string();
    if short_desc.is_empty() || short_desc.len() > 140 {
        return Err(AppError::Validation("short_description must be 1-140 characters".to_string()).into_response());
    }
    if payload.description.trim().len() < 10 {
        return Err(AppError::Validation("description must be at least 10 characters".to_string()).into_response());
    }
    if payload.description.trim().len() > 10_000 {
        return Err(AppError::Validation("description must be at most 10,000 characters".to_string()).into_response());
    }
    if !payload.website_url.starts_with("https://") {
        return Err(AppError::Validation("website_url must start with https://".to_string()).into_response());
    }
    if let Some(ref gh) = payload.github_url {
        if !gh.is_empty() && !gh.starts_with("https://github.com/") {
            return Err(AppError::Validation("github_url must start with https://github.com/".to_string()).into_response());
        }
    }
    // Validate optional URL fields start with https://
    for (field_name, field_val) in [
        ("logo_url", &payload.logo_url),
        ("docs_url", &payload.docs_url),
        ("api_endpoint_url", &payload.api_endpoint_url),
    ] {
        if let Some(ref url) = field_val {
            if !url.is_empty() && !url.starts_with("https://") && !url.starts_with("http://") {
                return Err(AppError::Validation(format!("{} must start with https:// or http://", field_name)).into_response());
            }
        }
    }
    let email = payload.contact_email.trim().to_string();
    if !email.contains('@') || !email.contains('.') {
        return Err(AppError::Validation("contact_email must be a valid email address".to_string()).into_response());
    }
    if payload.categories.is_empty() {
        return Err(AppError::Validation("at least one category is required".to_string()).into_response());
    }

    // --- Validate tag format before DB operations ---
    static TAG_RE: std::sync::LazyLock<regex::Regex> = std::sync::LazyLock::new(|| {
        regex::Regex::new(r"^[a-z0-9][a-z0-9-]{0,59}$").expect("valid regex")
    });
    let tag_re = &*TAG_RE;
    let mut validated_tags: Vec<String> = Vec::new();
    for tag_name_raw in &payload.tags {
        let tag_name = tag_name_raw.trim().to_lowercase();
        if tag_name.is_empty() || tag_name.len() > 60 {
            return Err(AppError::Validation(format!("tag '{}' must be 1-60 characters", tag_name_raw)).into_response());
        }
        if !tag_re.is_match(&tag_name) {
            return Err(AppError::Validation(format!("tag '{}' must be lowercase alphanumeric and hyphens only", tag_name_raw)).into_response());
        }
        validated_tags.push(tag_name);
    }

    // --- Generate slug ---
    let slug = crate::slug::unique_slug(&name, pool.inner())
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    // --- All DB writes wrapped in a transaction to prevent orphaned listings ---
    let mut tx = pool.inner().begin()
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    // --- Insert listing ---
    let listing_id: uuid::Uuid = sqlx::query_scalar(
        "INSERT INTO listings \
         (id, name, slug, short_description, description, logo_url, website_url, \
          github_url, docs_url, api_endpoint_url, contact_email, status) \
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') \
         RETURNING id"
    )
    .bind(&name)
    .bind(&slug)
    .bind(&short_desc)
    .bind(payload.description.trim())
    .bind(&payload.logo_url)
    .bind(&payload.website_url)
    .bind(&payload.github_url)
    .bind(&payload.docs_url)
    .bind(&payload.api_endpoint_url)
    .bind(&email)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    // --- Associate categories (verify existence first) ---
    for cat_id in &payload.categories {
        let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)")
            .bind(cat_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| AppError::Db(e).into_response())?;
        if !exists {
            return Err(AppError::Validation(format!("category {} does not exist", cat_id)).into_response());
        }
        sqlx::query("INSERT INTO listing_categories (listing_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(listing_id)
            .bind(cat_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Db(e).into_response())?;
    }

    // --- Upsert tags and associate ---
    for tag_name in &validated_tags {
        let tag_slug = slug::slugify(tag_name);
        let tag_id: uuid::Uuid = sqlx::query_scalar(
            "INSERT INTO tags (id, name, slug) VALUES (gen_random_uuid(), $1, $2) \
             ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name \
             RETURNING id"
        )
        .bind(tag_name)
        .bind(&tag_slug)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

        sqlx::query("INSERT INTO listing_tags (listing_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(listing_id)
            .bind(tag_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Db(e).into_response())?;
    }

    // --- Associate chains (verify existence first) ---
    for chain_id in &payload.chains {
        let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM chain_support WHERE id = $1)")
            .bind(chain_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| AppError::Db(e).into_response())?;
        if !exists {
            return Err(AppError::Validation(format!("chain {} does not exist", chain_id)).into_response());
        }
        sqlx::query("INSERT INTO listing_chains (listing_id, chain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(listing_id)
            .bind(chain_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Db(e).into_response())?;
    }

    // --- Store chain suggestions ---
    for suggested in &payload.suggested_chains {
        let name = suggested.trim().to_string();
        if name.is_empty() || name.len() > 100 {
            continue;
        }
        sqlx::query(
            "INSERT INTO chain_suggestions (id, name, listing_id, status) \
             VALUES (gen_random_uuid(), $1, $2, 'pending')"
        )
        .bind(&name)
        .bind(listing_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Db(e).into_response())?;
    }

    // --- Fetch submitted_at for response ---
    let submitted_at: chrono::DateTime<chrono::Utc> = sqlx::query_scalar(
        "SELECT submitted_at FROM listings WHERE id = $1"
    )
    .bind(listing_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    // --- Commit transaction ---
    tx.commit()
        .await
        .map_err(|e| AppError::Db(e).into_response())?;

    let response = SubmitResponse {
        id: listing_id,
        slug: slug.clone(),
        status: "pending".to_string(),
        submitted_at,
    };

    Ok(rocket::response::status::Created::new(
        format!("/api/listings/{}", slug)
    ).body(Json(response)))
}

// ---------------------------------------------------------------------------
// PATCH /api/listings/:id/reputation — stubbed admin endpoint
// ---------------------------------------------------------------------------

/// PATCH /api/listings/:id/reputation
/// Stubbed endpoint — accepts a score payload, stores it, returns stubbed response.
/// Protected by AdminToken guard. For future reputation scoring service integration.
#[patch("/listings/<id>/reputation", data = "<body>")]
pub async fn patch_reputation(
    pool: &State<DbPool>,
    id: &str,
    body: Json<ReputationPayload>,
    _auth: AdminToken,
) -> Result<Json<ReputationResponse>, Custom<Json<ErrorBody>>> {
    let listing_id = uuid::Uuid::parse_str(id)
        .map_err(|_| AppError::Validation("invalid listing id".to_string()).into_response())?;

    let score = body.into_inner().score;

    // Validate score range: 0.00–100.00
    if !(0.0..=100.0).contains(&score) {
        return Err(AppError::Validation("reputation_score must be between 0.00 and 100.00".to_string()).into_response());
    }

    // Store the score (stubbed — in production this comes from the scoring service)
    let updated: Option<uuid::Uuid> = sqlx::query_scalar(
        "UPDATE listings SET reputation_score = $1, updated_at = now() WHERE id = $2 RETURNING id"
    )
    .bind(score)
    .bind(listing_id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    if updated.is_none() {
        return Err(AppError::NotFound.into_response());
    }

    Ok(Json(ReputationResponse {
        id: listing_id,
        reputation_score: Some(score),
        message: "Reputation score updated (stubbed — scoring service integration pending)".to_string(),
    }))
}
