use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// Full database row for a listing — used internally and in admin endpoints.
/// Contains all fields including sensitive ones (contact_email, rejection_note).
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Listing {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub short_description: String,
    pub description: String,
    pub logo_url: Option<String>,
    pub website_url: String,
    pub github_url: Option<String>,
    pub docs_url: Option<String>,
    pub api_endpoint_url: Option<String>,
    pub contact_email: String,
    pub status: String,
    pub rejection_note: Option<String>,
    pub reputation_score: Option<f64>,
    pub is_featured: bool,
    pub view_count: i32,
    pub submitted_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub approved_at: Option<DateTime<Utc>>,
}

/// Public-facing listing — omits sensitive fields, adds related data.
/// Used in all public API responses.
#[derive(Debug, Serialize, Deserialize)]
pub struct PublicListing {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub short_description: String,
    pub description: String,
    pub logo_url: Option<String>,
    pub website_url: String,
    pub github_url: Option<String>,
    pub docs_url: Option<String>,
    pub api_endpoint_url: Option<String>,
    pub reputation_score: Option<f64>,
    pub is_featured: bool,
    pub view_count: i32,
    pub submitted_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub approved_at: Option<DateTime<Utc>>,
    pub categories: Vec<CategoryRef>,
    pub tags: Vec<TagRef>,
    pub chains: Vec<ChainRef>,
}

/// Deserialized from POST /listings request body.
/// All fields are Optional at the serde level so that missing-field errors
/// are reported as structured field-level validation errors instead of a
/// generic 422 from the Rocket catcher.
#[derive(Debug, Deserialize)]
pub struct NewListing {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub short_description: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    pub logo_url: Option<String>,
    #[serde(default)]
    pub website_url: Option<String>,
    pub github_url: Option<String>,
    pub docs_url: Option<String>,
    pub api_endpoint_url: Option<String>,
    #[serde(default)]
    pub contact_email: Option<String>,
    /// Category UUIDs to associate with this listing (min 1)
    #[serde(default)]
    pub categories: Vec<Uuid>,
    /// Tag names (will be created if they don't exist, lowercase, max 60 chars)
    #[serde(default)]
    pub tags: Vec<String>,
    /// Chain UUIDs to associate with this listing
    #[serde(default)]
    pub chains: Vec<Uuid>,
    /// User-suggested chain names (not yet in chain_support table)
    #[serde(default)]
    pub suggested_chains: Vec<String>,
}

/// A chain suggestion row from the chain_suggestions table.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChainSuggestion {
    pub id: Uuid,
    pub name: String,
    pub listing_id: Uuid,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
}

/// Reference to a category in listing responses.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CategoryRef {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}

/// Reference to a tag in listing responses.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TagRef {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}

/// Reference to a chain in listing responses.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ChainRef {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub is_featured: bool,
}
