use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};

pub struct AdminToken;

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AdminToken {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = match req.headers().get_one("Authorization") {
            Some(h) if h.starts_with("Bearer ") => &h[7..],
            _ => return Outcome::Error((Status::Unauthorized, ())),
        };

        let expected = std::env::var("ADMIN_TOKEN").unwrap_or_default();
        if !expected.is_empty() && token == expected {
            Outcome::Success(AdminToken)
        } else {
            Outcome::Error((Status::Unauthorized, ()))
        }
    }
}
