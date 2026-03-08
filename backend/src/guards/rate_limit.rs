use std::net::IpAddr;
use std::num::NonZeroU32;
use std::sync::Arc;

use dashmap::DashMap;
use governor::clock::DefaultClock;
use governor::state::{InMemoryState, NotKeyed};
use governor::{Quota, RateLimiter};
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};

// Type alias for a single-key (not-keyed) in-memory rate limiter
type Limiter = Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>;

/// Managed state: map from IP -> per-IP rate limiter for read endpoints.
/// 60 requests per minute per IP.
pub struct ReadRateLimiters(pub DashMap<IpAddr, Limiter>);

/// Managed state: map from IP -> per-IP rate limiter for submission endpoint.
/// 30 requests per hour per IP.
pub struct SubmitRateLimiters(pub DashMap<IpAddr, Limiter>);

impl ReadRateLimiters {
    pub fn new() -> Self {
        ReadRateLimiters(DashMap::new())
    }
}

impl SubmitRateLimiters {
    pub fn new() -> Self {
        SubmitRateLimiters(DashMap::new())
    }
}

/// Request guard that enforces read rate limit (60/min per IP).
/// Add `_rl: ReadRateLimit` as a parameter to any GET handler to protect it.
pub struct ReadRateLimit;

/// Request guard that enforces submit rate limit (30/hour per IP).
/// Add `_rl: SubmitRateLimit` as a parameter to POST /api/listings handler.
pub struct SubmitRateLimit;

fn get_client_ip(req: &Request<'_>) -> Option<IpAddr> {
    // Only trust proxy headers when explicitly configured (TRUST_PROXY=true)
    let trust_proxy = std::env::var("TRUST_PROXY")
        .map(|v| v == "true" || v == "1")
        .unwrap_or(false);

    if trust_proxy {
        if let Some(ip_str) = req.headers().get_one("X-Real-IP") {
            if let Ok(ip) = ip_str.parse::<IpAddr>() {
                return Some(ip);
            }
        }
        if let Some(ip_str) = req.headers().get_one("X-Forwarded-For") {
            if let Some(first) = ip_str.split(',').next() {
                if let Ok(ip) = first.trim().parse::<IpAddr>() {
                    return Some(ip);
                }
            }
        }
    }

    req.client_ip()
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for ReadRateLimit {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let limiters = match req.guard::<&rocket::State<ReadRateLimiters>>().await {
            Outcome::Success(s) => s,
            _ => return Outcome::Success(ReadRateLimit), // fail open if state missing
        };

        let ip = match get_client_ip(req) {
            Some(ip) => ip,
            None => return Outcome::Success(ReadRateLimit), // fail open if no IP
        };

        // Get or create per-IP limiter: 60 requests per minute
        let limiter = limiters
            .0
            .entry(ip)
            .or_insert_with(|| {
                Arc::new(RateLimiter::direct(
                    Quota::per_minute(NonZeroU32::new(60).unwrap()),
                ))
            })
            .clone();

        match limiter.check() {
            Ok(()) => Outcome::Success(ReadRateLimit),
            Err(_) => Outcome::Error((Status::TooManyRequests, ())),
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for SubmitRateLimit {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let limiters = match req.guard::<&rocket::State<SubmitRateLimiters>>().await {
            Outcome::Success(s) => s,
            _ => return Outcome::Success(SubmitRateLimit), // fail open
        };

        let ip = match get_client_ip(req) {
            Some(ip) => ip,
            None => return Outcome::Success(SubmitRateLimit), // fail open
        };

        // Get or create per-IP limiter: 30 requests per hour
        let limiter = limiters
            .0
            .entry(ip)
            .or_insert_with(|| {
                Arc::new(RateLimiter::direct(
                    Quota::per_hour(NonZeroU32::new(30).unwrap()),
                ))
            })
            .clone();

        match limiter.check() {
            Ok(()) => Outcome::Success(SubmitRateLimit),
            Err(_) => Outcome::Error((Status::TooManyRequests, ())),
        }
    }
}
