use rocket::serde::json::Json;
use rocket::State;

use crate::db::DbPool;
use crate::errors::AppError;
use crate::guards::rate_limit::ReadRateLimit;
use crate::models::tag::Tag;

/// GET /api/tags
/// Returns all tags ordered by listing_count descending (most-used first).
#[get("/tags")]
pub async fn list_tags(
    pool: &State<DbPool>,
    _rl: ReadRateLimit,
) -> Result<Json<Vec<Tag>>, rocket::response::status::Custom<Json<crate::errors::ErrorBody>>> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT t.id, t.name, t.slug, \
         COALESCE(cnt.c, 0)::int AS listing_count \
         FROM tags t \
         LEFT JOIN ( \
           SELECT lt.tag_id, COUNT(*) AS c \
           FROM listing_tags lt \
           INNER JOIN listings l ON l.id = lt.listing_id AND l.status = 'approved' \
           GROUP BY lt.tag_id \
         ) cnt ON cnt.tag_id = t.id \
         ORDER BY listing_count DESC, t.name ASC"
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(tags))
}
