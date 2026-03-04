# AgentRadar

AI-first agent application directory built for the **Humans Not Required** initiative by Nervos/CKB. Discover, track, and submit AI agents and tools across the decentralized web.

Both AI agents (via REST API) and humans (via React UI) are first-class consumers — no second-class citizens.

## Architecture

- **Backend**: Rust + Rocket + PostgreSQL (SQLx migrations, auto-run on startup)
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Data fetching**: TanStack React Query
- **Admin auth**: Single Bearer token (`ADMIN_TOKEN` env var)
- **Rate limiting**: In-memory via `governor` crate (60/min reads, 3/hr submissions)
- **CORS**: Configurable via `FRONTEND_URL` env var

## Prerequisites

- Rust 1.75+ (with `cargo`)
- Node.js 18+ (with `npm`)
- PostgreSQL 15+

## Setup

### 1. Clone & Configure

```bash
# Copy the env template at the project root and configure
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and ADMIN_TOKEN
```

The `.env` file lives in the **project root** (not inside `backend/` or `frontend/`). Both services read from it.

### 2. Database

```bash
createdb agent_directory
# Migrations and seed data run automatically when the backend starts — no manual step needed.
```

### 3. Backend

```bash
cd backend
cargo run
# Server starts on http://localhost:8000
# Migrations run automatically on startup via sqlx::migrate!()
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev    # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:8000` automatically (configured in `vite.config.ts`).

### 5. Production Build

```bash
cd frontend
npm run build   # Outputs to dist/
```

Serve the `dist/` folder with any static file server (Nginx, Caddy, etc.) and route `/api` requests to the Rocket backend. For local dev, leave `VITE_API_BASE_URL` unset (the Vite proxy handles it). For production, set `VITE_API_BASE_URL` **at build time** only if frontend and backend are on different origins.

## Environment Variables

All variables are set in the root `.env` file.

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | — |
| `ADMIN_TOKEN` | Yes | Admin password used as Bearer token | — |
| `ROCKET_PORT` | No | Backend server port | `8000` |
| `ROCKET_ADDRESS` | No | Backend bind address | `0.0.0.0` |
| `FRONTEND_URL` | No | Allowed CORS origin | `http://localhost:5173` |
| `TRUST_PROXY` | No | Trust `X-Real-IP` / `X-Forwarded-For` for rate limiting behind a reverse proxy | `false` |
| `VITE_API_BASE_URL` | No | API base URL for frontend production builds | `""` (same-origin) |

## Project Structure

```
.env                     # All environment variables (root level)
.env.example             # Template

backend/
  src/
    main.rs              # Rocket server, CORS fairing, JSON error catchers, route mounting
    routes/
      listings.rs        # Public: GET/POST /api/listings, GET /api/listings/:slug, PATCH reputation
      categories.rs      # Public: GET /api/categories
      tags.rs            # Public: GET /api/tags
      chains.rs          # Public: GET /api/chains
      admin/
        listings.rs      # Admin: CRUD, approve, reject, stats, chain suggestions
    models/              # Rust structs (Listing, PublicListing, Category, Tag, Chain, etc.)
    guards/
      admin_token.rs     # Bearer token auth guard
      rate_limit.rs      # Per-IP rate limiting (governor)
    errors.rs            # Unified JSON error responses ({ "error": "...", "code": "..." })
    slug.rs              # Slug generation + uniqueness
  migrations/            # SQL migrations (auto-run on startup)

frontend/
  src/
    pages/               # Route pages (Home, Browse, ListingDetail, Submit, ApiDocs, admin/)
    components/          # Shared UI (ListingCard, FilterBar, ListingLogo, ErrorBoundary, etc.)
    lib/
      api.ts             # Typed fetch wrapper for all endpoints
      constants.ts       # APP_NAME, API_BASE_URL
      categoryColors.ts  # Category color mapping
    hooks/               # useListingsQuery (URL-synced filters + pagination)
    types/               # TypeScript interfaces
  vite.config.ts         # Dev server proxy: /api → localhost:8000
```

## API

Full interactive documentation is available at `/api-docs` in the running application.

### Public Endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/listings` | Paginated listing search with filters (`search`, `category`, `tag`, `chain`, `sort`) |
| `GET` | `/api/listings/:slug` | Single listing detail (atomically increments view count) |
| `POST` | `/api/listings` | Submit a new listing (enters pending queue, rate limited to 3/hr) |
| `GET` | `/api/categories` | All categories with listing counts |
| `GET` | `/api/tags` | All tags with listing counts |
| `GET` | `/api/chains` | All supported chains |

### Authenticated Endpoints (Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/listings/:id/reputation` | Update reputation score (stubbed for future scoring service) |

All errors return JSON: `{ "error": "...", "code": "..." }`. POST/PATCH requests require `Content-Type: application/json`. See `/api-docs` for full response schemas, error codes, and rate limit details.

### Agent Workflow Example

```bash
# 1. Discover categories and chains
curl https://your-domain.com/api/categories
curl https://your-domain.com/api/chains

# 2. Search listings
curl "https://your-domain.com/api/listings?search=wallet&chain=ckb&sort=views"

# 3. Get listing detail
curl https://your-domain.com/api/listings/some-tool-slug

# 4. Submit a new listing
curl -X POST https://your-domain.com/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My AI Tool",
    "short_description": "Brief description under 140 chars",
    "description": "Full markdown description (min 10 chars)...",
    "website_url": "https://example.com",
    "contact_email": "you@example.com",
    "categories": ["<category-uuid>"],
    "tags": ["ai-agent", "defi"],
    "chains": ["<chain-uuid>"]
  }'
# Returns: { "id": "uuid", "slug": "my-ai-tool", "status": "pending", "submitted_at": "..." }
```

## Admin Panel

Access at `/admin` (not linked from public UI - intentional). Log in with the `ADMIN_TOKEN` value from `.env`.

- Dashboard with stats (total, pending, approved, rejected, total views)
- Approve/reject submissions with optional rejection notes
- Full listing editing (name, description, URLs, categories, tags, chains)
- Toggle CKB Featured badge
- Manage chain suggestions from submitters
- Create new categories and chains

Approved listings appear on the public site immediately. Rejected or pending listings are never visible to public users or API consumers.

## Author

Made with love by [Furqan (@furqandotahmed)](https://x.com/furqandotahmed) in Pakistan.

## Nervos / CKB

AgentRadar is part of the **Humans Not Required** initiative by [Nervos Network](https://www.nervos.org/). The initiative explores AI-first infrastructure on CKB — where agents are first-class participants, not afterthoughts. CKB appears as a featured chain in the directory, but the platform is ecosystem-neutral and welcomes agents across all chains.


