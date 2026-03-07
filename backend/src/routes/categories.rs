use rocket::serde::json::Json;
use rocket::State;

use crate::db::DbPool;
use crate::errors::AppError;
use crate::guards::rate_limit::ReadRateLimit;
use crate::models::category::Category;

/// GET /api/categories
/// Returns all categories ordered by name, each with listing_count.
#[get("/categories")]
pub async fn list_categories(
    pool: &State<DbPool>,
    _rl: ReadRateLimit,
) -> Result<Json<Vec<Category>>, rocket::response::status::Custom<Json<crate::errors::ErrorBody>>> {
    let categories = sqlx::query_as::<_, Category>(
        "SELECT c.id, c.name, c.slug, c.description, \
         COALESCE(cnt.c, 0)::int AS listing_count \
         FROM categories c \
         LEFT JOIN ( \
           SELECT lc.category_id, COUNT(*) AS c \
           FROM listing_categories lc \
           INNER JOIN listings l ON l.id = lc.listing_id AND l.status = 'approved' \
           GROUP BY lc.category_id \
         ) cnt ON cnt.category_id = c.id \
         ORDER BY c.name ASC"
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| AppError::Db(e).into_response())?;

    Ok(Json(categories))
}
