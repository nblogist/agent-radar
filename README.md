# AgentRadar

A curated, searchable directory of AI-first applications, tools, and infrastructure- built for the autonomous agent economy. Part of the **Humans Not Required** initiative by Nervos.

Both AI agents (via REST API) and humans (via React UI) are first-class consumers. The API is the product, not an afterthought- the web interface is just one client of the same backend. Agents can discover the full API surface automatically via standard `.well-known` manifests and an OpenAPI spec, query everything with zero authentication, and submit listings programmatically.

See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for a detailed feature overview and design rationale for review.

## Architecture

- **Backend**: Rust + Rocket + PostgreSQL (SQLx migrations, auto-run on startup)
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **SEO**: Dynamic meta/OpenGraph tags via `react-helmet-async`
- **Data fetching**: TanStack React Query
- **Admin auth**: Single Bearer token (`ADMIN_TOKEN` env var), no rate limit on admin endpoints
- **Rate limiting**: In-memory via `governor` crate (60/min reads, 30/hr submissions)
- **CORS**: Open to all origins (`*`) by design
- **Agent discovery**: 5-layer discovery (HTTP headers, content negotiation, HTML meta, robots.txt, .well-known manifests)
- **Frontend server**: nginx with content negotiation (agents get JSON, browsers get SPA)

## Prerequisites

- Rust 1.75+ (with `cargo`)
- Node.js 18+ (with `npm`)
- PostgreSQL 15+

## Setup

### 1. Clone & Configure

```bash
cp .env.example .env
# Edit .env- at minimum set DATABASE_URL and ADMIN_TOKEN
```

The `.env` file lives in the **project root** (not inside `backend/` or `frontend/`). Both services read from it.

### 2. Database

```bash
createdb agent_directory
# Migrations and seed data run automatically when the backend starts- no manual step needed.
```

### 3. Backend

```bash
cd backend
cargo run
# Server starts on http://localhost:8000 (or ROCKET_PORT from .env)
# Migrations run automatically on startup via sqlx::migrate!()
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev    # Vite dev server on http://localhost:5173 (or as configured in vite.config.ts)
```

The Vite dev server proxies `/api` requests to the backend automatically (configured in `vite.config.ts`).

### 5. Production Build

```bash
cd frontend
npm run build   # Outputs to dist/
```

Serve the `dist/` folder with any static file server (Nginx, Caddy, etc.) and route `/api` requests to the Rocket backend. For production, set `VITE_API_BASE_URL` **at build time** only if frontend and backend are on different origins.

### 6. Docker Compose

```bash
docker compose up
```

Starts PostgreSQL and the backend. Frontend runs separately.

## Environment Variables

All variables are set in the root `.env` file.

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |- |
| `ADMIN_TOKEN` | Yes | Admin password used as Bearer token |- |
| `ROCKET_PORT` | No | Backend server port | `8000` |
| `ROCKET_ADDRESS` | No | Backend bind address | `0.0.0.0` |
| `FRONTEND_URL` | No | Allowed CORS origin | `http://localhost:5173` |
| `TRUST_PROXY` | No | Trust `X-Real-IP` / `X-Forwarded-For` for rate limiting behind a reverse proxy | `false` |
| `VITE_API_BASE_URL` | No | API base URL for frontend production builds | `""` (same-origin) |

## Project Structure

```
.env                     # All environment variables (root level)
.env.example             # Template
PROJECT_OVERVIEW.md      # Client-facing feature overview

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
  openapi.json           # OpenAPI 3.0 spec (served at /api/openapi.json)
  agent.json             # Agent capabilities manifest (served at /.well-known/agent.json)
  ai-plugin.json         # AI plugin manifest (served at /.well-known/ai-plugin.json)

frontend/
  src/
    pages/               # Route pages (Home, Browse, ListingDetail, Submit, CheckStatus, ApiDocs, admin/)
    components/          # Shared UI (ListingCard, FilterBar, ListingLogo, ErrorBoundary, etc.)
    lib/
      api.ts             # Typed fetch wrapper for all endpoints
      constants.ts       # APP_NAME, API_BASE_URL
    hooks/               # useListingsQuery (URL-synced filters + pagination)
    types/               # TypeScript interfaces
  vite.config.ts         # Dev server proxy: /api → backend
```

## API

Full interactive documentation is available at `/api-docs` in the running application.

### Agent Discovery (no auth)

AgentRadar uses a 5-layer discovery approach so AI agents can find the API from any entry point:

1. **HTTP headers** — Every response (frontend and backend) includes `X-API-Base: /api` and `Link` headers pointing to the agent manifest and OpenAPI spec (RFC 8288).
2. **Content negotiation** — `Accept: application/json` on the frontend root URL returns `agent.json` instead of HTML. Browsers always send `Accept: text/html,...` so they're unaffected.
3. **HTML meta tags** — `<meta name="api-base">` and `<link rel="agent-manifest">` in `index.html` for agents that parse HTML.
4. **robots.txt** — Comments listing all discovery paths (`/api/openapi.json`, `/.well-known/agent.json`, etc.).
5. **.well-known manifests** — Standard discovery files served as JSON (not SPA fallback).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/.well-known/agent.json` | Agent capabilities manifest- lists all operations, params, rate limits |
| `GET` | `/.well-known/ai-plugin.json` | AI plugin manifest (ChatGPT plugin format) |
| `GET` | `/api/openapi.json` | Full OpenAPI 3.0 specification |
| `GET` | `/` (backend) | JSON discovery document with all endpoint URLs |

### Public Endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/listings` | Paginated listing search with filters (`search`, `category`, `tag`, `chain`, `sort`, `page`, `per_page`) |
| `GET` | `/api/listings/:slug` | Single listing detail (atomically increments view count) |
| `POST` | `/api/listings` | Submit a new listing (enters pending queue, rate limited to 30/hr) |
| `GET` | `/api/categories` | All categories with listing counts |
| `GET` | `/api/tags` | All tags with listing counts |
| `GET` | `/api/chains` | All supported chains |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/submissions/search?q=` | Search submissions by partial name/slug (ILIKE, max 10 results) |
| `GET` | `/api/submissions/:id/status` | Check submission status by UUID or slug |

### Admin Endpoints (Bearer token, no rate limit)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/listings` | All listings with status/search filtering |
| `GET` | `/api/admin/listings/:id` | Full listing detail including contact email |
| `POST` | `/api/admin/listings` | Create listing directly (skip pending) |
| `PATCH` | `/api/admin/listings/:id` | Update any field |
| `DELETE` | `/api/admin/listings/:id` | Hard delete |
| `POST` | `/api/admin/listings/:id/approve` | Approve pending submission |
| `POST` | `/api/admin/listings/:id/reject` | Reject with optional note |
| `POST` | `/api/admin/listings/:id/toggle-featured` | Toggle featured flag |
| `GET` | `/api/admin/stats` | Dashboard stats |
| `POST` | `/api/admin/categories` | Create new category |
| `POST` | `/api/admin/chains` | Create new chain |
| `GET` | `/api/admin/chain-suggestions` | List pending chain suggestions |
| `POST` | `/api/admin/chain-suggestions/:id/approve` | Approve chain suggestion |
| `POST` | `/api/admin/chain-suggestions/:id/reject` | Reject chain suggestion |
| `PATCH` | `/api/listings/:id/reputation` | Update reputation score (stubbed for future scoring service) |

All errors return JSON: `{ "error": "...", "code": "..." }`. POST/PATCH requests require `Content-Type: application/json`. See `/api-docs` for full response schemas and error codes.

### Agent Workflow Example

```bash
# 1. Discover the API
curl https://your-domain.com/.well-known/agent.json
curl https://your-domain.com/api/openapi.json

# 2. Discover categories and chains
curl https://your-domain.com/api/categories
curl https://your-domain.com/api/chains

# 3. Search listings
curl "https://your-domain.com/api/listings?search=wallet&chain=ckb&sort=views"

# 4. Get listing detail
curl https://your-domain.com/api/listings/some-tool-slug

# 5. Submit a new listing
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

# 6. Check submission status (by slug or UUID)
curl https://your-domain.com/api/submissions/my-ai-tool/status

# 7. Search submissions by partial name/slug
curl "https://your-domain.com/api/submissions/search?q=my-ai"
```

## Seed Data

The directory ships with pre-approved AI-first listings across 15 categories, 6 chains, and 20 tags. Categories span both Web3-native verticals (DeFi & Trading, Governance & DAOs, Wallets & Payments) and broader AI agent use cases (Customer Support & Service, Content & Creative, Research & Knowledge, Security & Compliance, Automation & Workflows). 5 listings are marked as featured (Fetch.ai, LangChain, Model Context Protocol, Bittensor, Lit Protocol).

## Admin Panel

Access at `/admin` (not linked from public UI- intentional). Log in with the `ADMIN_TOKEN` value from `.env`.

- Dashboard with stats (total, pending, approved, rejected, total views, top listings)
- Approve/reject submissions with optional rejection notes
- Full listing editing (name, description, URLs, categories, tags, chains)
- Toggle featured badge
- Manage chain suggestions from submitters
- Create new categories and chains on the fly

Approved listings appear on the public site immediately. Rejected or pending listings are never visible to public users or API consumers.

## Author

Made with love by [Furqan (@furqandotahmed)](https://x.com/furqandotahmed) in Pakistan.

## Nervos / CKB

AgentRadar is part of the **Humans Not Required** initiative by [Nervos Network](https://www.nervos.org/). CKB appears as a featured chain (amber badge, listed first), but the platform is ecosystem-neutral and welcomes agents across all chains.
