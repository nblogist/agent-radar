# AgentRadar- Project Overview

**Humans Not Required Initiative · Nervos/CKB**
**Version 1.0 · March 2026**

---

## What Is This?

AgentRadar is a curated, searchable directory of AI-first applications, tools, and infrastructure- built for the autonomous agent economy. Think DappRadar, but purpose-built for AI agents and the humans behind them.

The core principle is **Autonomous-Agent-First, Human-Friendly**: every feature works equally well for an AI agent calling the API directly and a human browsing the web interface. Neither is a second-class citizen.

This is part of the broader Humans Not Required ecosystem sponsored by Nervos. The directory serves as the discovery and promotion layer for every other product in the initiative (Agent Wallet, Agent Marketplace, Agent Reputation Scoring, etc.). Its success directly amplifies the visibility of the entire ecosystem.

---

## Who Is It For?

**AI Agents**- Background agents and personal agents that need to discover tools and services programmatically. They hit the REST API directly, no browser required.

**Developers & Builders**- People actively building with agents who need to find reliable tooling fast. They care about API quality, documentation, and whether a listing is credible.

**Enthusiasts & Explorers**- People drawn to the agent space for discovery and novelty. They browse the directory, explore trending tools, and submit their own projects.

---

## Features Built

### Directory Browsing

The main browsing experience lets users discover and explore listings through multiple paths:

- **Home page** with a hero search bar, top-viewed listings table, and trending category pills for quick exploration
- **Browse page** with full filtering sidebar- search by name/description, filter by category, chain, or tag, sort by newest/most viewed/alphabetical
- **Listing detail pages** with full markdown descriptions, external links (website, GitHub, docs, API endpoint), chain badges, category and tag labels, view counts, and timestamps
- **Responsive design**- fully functional on mobile, tablet, and desktop
- **Reputation score field** on every listing- currently displays "N/A" with a tooltip ("Reputation scoring coming soon"). The field is ready for the separate Reputation Scoring system to populate via API when it goes live

### Listing Submission

Anyone can submit a listing without creating an account:

- Multi-section form with client-side validation (name, description, website URL, contact email, categories, tags, chains, and optional fields like GitHub URL, docs URL, API endpoint, logo)
- Markdown editor with live preview for the full description
- Submissions enter a **pending queue**- they are not visible to the public until an admin approves them
- Rate limited to 30 submissions per hour per IP to prevent spam
- On success, the submitter gets a confirmation with their submission ID

### Admin Panel

A password-protected admin interface for managing the directory:

- **Dashboard** with stats: total listings, approved/pending/rejected counts, total views across all listings, and a top-listings-by-views table
- **Listings management**- searchable table of all submissions with status tabs (All / Pending / Approved / Rejected)
- **Approve or reject** submissions with optional rejection notes
- **Full listing editor**- edit any field on any listing after approval
- **Delete listings** with confirmation
- **Toggle featured badge** on listings
- **Create new categories and chains** on the fly
- **Chain suggestions**- when submitters suggest a chain that doesn't exist yet, admins can review and approve/reject the suggestion

### REST API

The entire directory is consumable via a clean JSON API. All read endpoints require no authentication- agents can discover, filter, and retrieve data programmatically without any browser interaction.

**Public endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Paginated listings with search, category, tag, chain, and sort filters |
| GET | `/api/listings/:slug` | Single listing detail (increments view count) |
| GET | `/api/categories` | All categories with listing counts |
| GET | `/api/tags` | All tags with listing counts |
| GET | `/api/chains` | All supported chains |
| GET | `/api/health` | Health check |
| GET | `/api/submissions/:id/status` | Check submission review status |
| POST | `/api/listings` | Submit a new listing (enters pending queue) |

**Admin endpoints** (require `Authorization: Bearer <token>` header):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/listings` | All listings with status/search filtering |
| GET | `/api/admin/listings/:id` | Full listing detail including contact email |
| POST | `/api/admin/listings` | Create listing directly (skip pending) |
| PATCH | `/api/admin/listings/:id` | Update any field |
| DELETE | `/api/admin/listings/:id` | Hard delete |
| POST | `/api/admin/listings/:id/approve` | Approve pending submission |
| POST | `/api/admin/listings/:id/reject` | Reject with optional note |
| PATCH | `/api/admin/listings/:id/featured` | Toggle featured flag |
| GET | `/api/admin/stats` | Aggregate dashboard stats |
| POST | `/api/admin/categories` | Create new category |
| POST | `/api/admin/chains` | Create new chain |
| GET | `/api/admin/chain-suggestions` | List pending chain suggestions |
| POST | `/api/admin/chain-suggestions/:id/approve` | Approve chain suggestion |
| POST | `/api/admin/chain-suggestions/:id/reject` | Reject chain suggestion |

**Reputation score endpoint** (stubbed for future integration):

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/listings/:id/reputation` | Set reputation score (0-100)- for the external Reputation Scoring service |

### Agent-First Discovery

Beyond the standard REST API, the platform publishes machine-readable discovery manifests so AI agents can find and understand the API automatically:

- **`/.well-known/ai-plugin.json`**- AI plugin manifest (ChatGPT plugin format)
- **`/.well-known/agent.json`**- Agent capabilities manifest listing all available operations, parameters, rate limits, and auth requirements
- **`/api/openapi.json`**- Full OpenAPI 3.0 specification

These are served directly by the backend- no separate documentation system needed.

### API Documentation Page

A human-readable API docs page at `/api-docs` in the web interface, showing all endpoints, parameters, request/response examples, rate limits, CORS policy, and error formats. Designed for developers looking to get started.

### What Makes This Actually Agent-First

"Agent-first" is easy to slap on a product and hard to mean it. Here's what it means concretely in this build:

**Agents can find the API without being told about it.** The platform publishes standard discovery manifests at `/.well-known/agent.json` and `/.well-known/ai-plugin.json`, plus a full OpenAPI 3.0 spec at `/api/openapi.json`. An agent hitting the domain cold can discover every available endpoint, parameter, and response shape without any human handing it documentation. This is how agent discovery actually works in practice- agents probe well-known paths and parse machine-readable specs.

**Zero authentication for all read operations.** No API keys, no OAuth, no signup, no cookies, no sessions. An agent can start querying listings, categories, chains, and tags immediately. The only endpoints that require auth are admin operations, which agents don't need.

**Every response is structured, predictable JSON.** No HTML scraping, no inconsistent formats. Pagination always returns `{ data: [...], meta: { page, per_page, total, total_pages } }`. Errors always return `{ error: "message", code: "CODE" }`. An agent can parse every response with the same logic.

**CORS is wide open by design.** `Access-Control-Allow-Origin: *` on all endpoints. Browser-based agents and cross-origin consumers work out of the box- no proxy configuration, no preflight headaches.

**The API is the product, not an afterthought.** The UI and the API share the same backend, the same data, the same capabilities. The web interface is just one client of the API. An agent using the API has access to everything a human browsing the site does- search, filter, sort, paginate, read details, submit listings, check submission status.

**Rate limits are agent-aware.** Instead of session-based limits that break stateless agents, rate limiting is purely IP-based with proper `429` status codes and `Retry-After` headers. An agent can detect throttling and back off programmatically without guessing.

I validated all of this by running 50 autonomous agents against the live platform with zero prior knowledge of the codebase. They discovered the API on their own, exercised every feature, and confirmed the whole flow works end-to-end from an agent's perspective.

### Security & Infrastructure

- **Rate limiting**- Per-IP, in-memory (no Redis dependency for v1):
  - Read endpoints: 60 requests/minute
  - Submit endpoint: 30 requests/hour
  - Admin endpoints: no rate limit (token-protected)
- **CORS**- Permissive by default (`Access-Control-Allow-Origin: *`) so agents and cross-origin consumers can call all endpoints without proxy configuration
- **Input validation**- Both client-side (Zod schema) and server-side with field-level error messages
- **Admin auth**- Single Bearer token compared against the `ADMIN_TOKEN` environment variable. No OAuth complexity for v1
- **Consistent error responses**- All errors return `{ "error": "message", "code": "ERROR_CODE" }` with proper HTTP status codes (400, 401, 404, 422, 429, 500)
- **Null byte sanitization**- Malformed inputs containing null bytes are rejected before reaching the database

---

## Seed Data

The directory launches pre-populated with **14 real AI-first listings** across all categories and chains, including projects like Joule Finance, .bit, Fetch.ai, SingularityNET, XMTP, Lit Protocol, and others. Each listing has a full markdown description, working external links, and relevant tags.

**8 categories:** Wallets & Payments, Identity & Reputation, Communication & Messaging, Marketplaces & Task Coordination, Social & Community, Developer Tools & Infrastructure, Data & Analytics, Other

**6 chains:** CKB/Nervos (featured), Ethereum, Solana, Bitcoin, Multi-chain, Chain-agnostic

**20 tags:** ai-agent, llm, autonomous, defi, nft, wallet, sdk, api, analytics, oracle, cross-chain, identity, dao, privacy, infrastructure, payments, smart-contract, machine-learning, chatbot, developer-tools

---

## Nervos/CKB Integration

CKB is treated as a **featured chain**- it appears first in chain lists with a distinct amber badge, but the platform is ecosystem-neutral by design. The directory supports multiple chains and doesn't lock users into CKB. This follows the initiative's guidance: Nervos benefits more as a meaningful component of a widely used application than as the exclusive focus of one that never gains traction.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust + Rocket |
| Database | PostgreSQL (with trigram indexes for search) |
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Data Fetching | TanStack React Query |
| Routing | React Router v6 |
| Form Validation | React Hook Form + Zod |
| State (admin) | Zustand (in-memory only, no persistence) |
| Rate Limiting | governor crate (in-memory, per-IP) |
| Containerization | Docker Compose (PostgreSQL + backend) |

---

## What's Not In v1 (Out of Scope)

These were explicitly scoped out for the initial release:

- User accounts or authentication for submitters
- Comments, ratings, or reviews on listings
- Paid or promoted listing tiers
- Email notifications to submitters on approval/rejection
- Live reputation score integration (placeholder field only)
- Mobile app
- S3/cloud logo storage

---

Built by DotMatrix
Furqan A.