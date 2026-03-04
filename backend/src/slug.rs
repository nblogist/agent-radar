use slug::slugify;
use sqlx::PgPool;

/// Generate a unique URL-safe slug for a listing name.
///
/// Uses the `slug` crate's `slugify()` for URL-safe conversion, then checks
/// uniqueness against the listings table. If the base slug collides, appends
/// `-2`, `-3`, etc. until a unique slug is found.
pub async fn unique_slug(name: &str, pool: &PgPool) -> Result<String, sqlx::Error> {
    let base = slugify(name);

    // Reject names that produce empty slugs (e.g. all special characters)
    if base.is_empty() {
        return Err(sqlx::Error::Protocol(
            "name must contain at least one alphanumeric character".to_string(),
        ));
    }

    // Check if the base slug is already taken
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM listings WHERE slug = $1)"
    )
    .bind(&base)
    .fetch_one(pool)
    .await?;

    if !exists {
        return Ok(base);
    }

    // Try appending -2, -3, etc. until we find a unique slug (max 100 attempts)
    let mut counter: u32 = 2;
    loop {
        if counter > 100 {
            return Err(sqlx::Error::Protocol(
                "Could not generate a unique slug after 100 attempts".to_string(),
            ));
        }

        let candidate = format!("{}-{}", base, counter);

        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM listings WHERE slug = $1)"
        )
        .bind(&candidate)
        .fetch_one(pool)
        .await?;

        if !exists {
            return Ok(candidate);
        }

        counter += 1;
    }
}
