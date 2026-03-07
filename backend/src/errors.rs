use rocket::http::Status;
use rocket::response::status::Custom;
use rocket::serde::json::Json;
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Serialize)]
pub struct ErrorBody {
    pub error: String,
    pub code: String,
    /// Field-level validation errors (populated for VALIDATION code)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fields: Option<Vec<FieldError>>,
}

#[derive(Debug, Serialize, Clone)]
pub struct FieldError {
    pub field: String,
    pub message: String,
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Db(#[from] sqlx::Error),

    #[error("Not found")]
    NotFound,

    #[error("Validation: {0}")]
    Validation(String),

    /// Multiple field-level validation errors returned at once
    #[error("Validation failed")]
    ValidationErrors(Vec<FieldError>),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Rate limit exceeded")]
    RateLimit { retry_after: u64 },
}

impl AppError {
    pub fn into_response(self) -> Custom<Json<ErrorBody>> {
        let (status, code, msg, fields) = match &self {
            AppError::NotFound =>
                (Status::NotFound, "NOT_FOUND", self.to_string(), None),
            AppError::Validation(m) =>
                (Status::UnprocessableEntity, "VALIDATION", m.clone(), None),
            AppError::ValidationErrors(errs) => {
                let summary = errs.iter()
                    .map(|e| format!("{}: {}", e.field, e.message))
                    .collect::<Vec<_>>()
                    .join("; ");
                (Status::UnprocessableEntity, "VALIDATION", summary, Some(errs.clone()))
            }
            AppError::Unauthorized =>
                (Status::Unauthorized, "UNAUTHORIZED", self.to_string(), None),
            AppError::RateLimit { retry_after } => (
                Status::TooManyRequests,
                "RATE_LIMIT",
                format!("Too many requests. Retry after {}s", retry_after),
                None,
            ),
            AppError::Db(ref e) => {
                tracing::error!("DB error: {:?}", e);
                (Status::InternalServerError, "DB_ERROR", "Internal error".into(), None)
            }
        };
        Custom(status, Json(ErrorBody { error: msg, code: code.into(), fields }))
    }
}
