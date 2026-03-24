import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { APP_NAME, API_BASE_URL } from '../lib/constants';

// Show the actual API base URL (backend domain in production, origin in dev with proxy)
const baseUrl = API_BASE_URL || window.location.origin;

function Endpoint({ method, path, description, params, body, response, rateLimit }: {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  description: string;
  params?: { name: string; type: string; desc: string }[];
  body?: string;
  response: string;
  rateLimit?: string;
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-500 font-extrabold',
    POST: 'bg-blue-500/15 text-blue-500 font-extrabold',
    PATCH: 'bg-amber-500/15 text-amber-500 font-extrabold',
  };
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-dark-border flex flex-wrap items-center gap-3">
        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm text-theme-text font-mono">{path}</code>
        {rateLimit && (
          <span className="ml-auto text-xs text-theme-text-muted">{rateLimit}</span>
        )}
      </div>
      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-theme-text">{description}</p>

        {params && params.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider mb-3">Query Parameters</h5>
            <div className="space-y-2">
              {params.map(p => (
                <div key={p.name} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <code className="font-mono text-xs font-bold shrink-0 text-code">{p.name}</code>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-dark-surface2 text-theme-text-secondary font-mono shrink-0">{p.type}</span>
                  <span className="text-theme-text-secondary text-xs">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {body && (
          <div>
            <h5 className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider mb-2">Request Body</h5>
            <pre className="bg-dark-surface2 rounded-lg p-4 text-xs text-theme-text font-mono overflow-x-auto">{body}</pre>
          </div>
        )}

        <div>
          <h5 className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider mb-2">Response</h5>
          <pre className="bg-dark-surface2 rounded-lg p-4 text-xs text-theme-text font-mono overflow-x-auto">{response}</pre>
        </div>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-12">
      <Helmet>
        <title>API Documentation</title>
        <meta name="description" content="REST API documentation for AgentRadar. Discover, filter, submit, and check listings programmatically." />
        <meta property="og:title" content={`API Documentation | ${APP_NAME}`} />
        <meta property="og:description" content="REST API documentation for AgentRadar. Discover, filter, submit, and check listings programmatically." />
        <meta property="og:type" content="website" />
      </Helmet>
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
        <Link className="text-theme-text-muted hover:text-primary transition-colors" to="/">Home</Link>
        <span className="text-theme-text-muted material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">API Documentation</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">API Documentation</h1>
        <p className="text-theme-text-secondary text-lg max-w-3xl">
          {APP_NAME} provides a RESTful API for discovering and submitting listings: agents, tools, protocols, and infrastructure.
          All responses are JSON. The base URL is <code className="text-primary font-mono text-sm">{baseUrl}/api</code>.
        </p>
      </div>

      {/* Rate Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-theme-text-muted mb-1">Read endpoints (GET)</p>
              <p className="text-lg font-bold">60 requests / minute</p>
            </div>
            <div>
              <p className="text-sm text-theme-text-muted mb-1">Submit endpoint (POST)</p>
              <p className="text-lg font-bold">30 requests / hour</p>
            </div>
          </div>
          <p className="text-xs text-theme-text-muted mt-4">Rate limits are per IP address. Exceeding the limit returns <code className="text-theme-text-secondary">429 Too Many Requests</code>.</p>
        </div>
      </section>

      {/* CORS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">CORS</h2>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <p className="text-sm text-theme-text-secondary mb-3">
            All API endpoints support Cross-Origin Resource Sharing (CORS) with permissive defaults for agent-first access.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-4"><code className="font-mono text-xs font-bold shrink-0 text-code">Access-Control-Allow-Origin</code><span className="text-theme-text">*</span></div>
            <div className="flex gap-4"><code className="font-mono text-xs font-bold shrink-0 text-code">Access-Control-Allow-Methods</code><span className="text-theme-text">GET, POST, PATCH, DELETE, OPTIONS</span></div>
            <div className="flex gap-4"><code className="font-mono text-xs font-bold shrink-0 text-code">Access-Control-Allow-Headers</code><span className="text-theme-text">Content-Type, Authorization</span></div>
          </div>
          <p className="text-xs text-theme-text-muted mt-4">Browser-based agents and cross-origin API consumers can call all endpoints without proxy configuration.</p>
        </div>
      </section>

      {/* Public Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Public Endpoints</h2>
        <div className="space-y-6">
          <Endpoint
            method="GET"
            path="/api/listings"
            description="Retrieve a paginated list of approved listings with optional filtering and sorting."
            rateLimit="60/min"
            params={[
              { name: 'search', type: 'string', desc: 'Filter by name or description (ILIKE match)' },
              { name: 'category', type: 'string', desc: 'Filter by category slug' },
              { name: 'tag', type: 'string', desc: 'Filter by tag slug' },
              { name: 'chain', type: 'string', desc: 'Filter by chain slug' },
              { name: 'sort', type: 'string', desc: '"newest" (default), "views", or "alpha"' },
              { name: 'page', type: 'number', desc: 'Page number (default: 1)' },
              { name: 'per_page', type: 'number', desc: 'Items per page (default: 20, max: 100)' },
              { name: 'format', type: 'string', desc: '"agent" - minimal response for AI agents (drops logo, dates, view counts)' },
            ]}
            response={`{
  "data": [
    {
      "id": "uuid",
      "name": "My AI Tool",
      "slug": "my-ai-tool",
      "short_description": "Brief description",
      "description": "Full markdown description",
      "logo_url": "https://...",
      "website_url": "https://...",
      "github_url": "https://github.com/...",
      "docs_url": "https://...",
      "api_endpoint_url": "https://...",
      "reputation_score": null,  // nullable -- populated by external scoring service
      "is_featured": false,
      "view_count": 42,
      "submitted_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-02T00:00:00Z",
      "approved_at": "2025-01-01T12:00:00Z",
      "categories": [{ "id": "uuid", "name": "...", "slug": "..." }],
      "tags": [{ "id": "uuid", "name": "...", "slug": "..." }],
      "chains": [{ "id": "uuid", "name": "...", "slug": "...", "is_featured": true }]
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 1, "total_pages": 1 }
}`}
          />

          <Endpoint
            method="GET"
            path="/api/listings/:slug"
            description="Retrieve a single listing by its slug. Atomically increments the view count."
            rateLimit="60/min"
            response={`{
  "id": "uuid",
  "name": "My AI Tool",
  "slug": "my-ai-tool",
  "short_description": "...",
  "description": "Full markdown...",
  "logo_url": "https://...",
  "website_url": "https://...",
  "github_url": "https://github.com/...",
  "docs_url": "https://...",
  "api_endpoint_url": "https://...",
  "reputation_score": null,
  "is_featured": false,
  "view_count": 43,
  "submitted_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-02T00:00:00Z",
  "approved_at": "2025-01-01T12:00:00Z",
  "categories": [{ "id": "uuid", "name": "...", "slug": "..." }],
  "tags": [{ "id": "uuid", "name": "...", "slug": "..." }],
  "chains": [{ "id": "uuid", "name": "...", "slug": "...", "is_featured": true }]
}`}
          />

          <Endpoint
            method="POST"
            path="/api/listings"
            description="Submit a new listing for review. The listing will be set to 'pending' status until an admin approves it. Unknown fields are rejected with a 422 error, use exactly the field names shown below. For agent submissions, contact_email is optional. A submitter_token UUID is returned as your identifier. Store it; it's only returned once."
            rateLimit="30/hour"
            body={`{
  "name": "My Agent Tool",          // required, 1-100 chars
  "short_description": "Brief...",   // required, 1-140 chars
  "description": "Full markdown...", // required, 10-10,000 chars
  "logo_url": "https://...",         // optional
  "website_url": "https://...",      // required, must start with https://
  "github_url": "https://github.com/...", // optional
  "docs_url": "https://...",         // optional
  "api_endpoint_url": "https://...", // optional
  "contact_email": "you@email.com",  // optional for agents, required for humans
  "categories": ["uuid", "uuid"],    // required, min 1 category UUID
  "tags": ["ai-agent", "defi"],      // optional, lowercase alphanumeric + hyphens
  "chains": ["uuid"],                // optional, chain UUIDs
  "suggested_chains": ["New Chain"]  // optional, suggest chains not yet listed
}`}
            response={`{
  "id": "uuid",
  "slug": "my-agent-tool",
  "status": "pending",
  "submitted_at": "2025-01-01T00:00:00Z",
  "submitter_token": "uuid  // store this, acts as your API key"
}`}
          />

          <Endpoint
            method="GET"
            path="/api/categories"
            description="Retrieve all categories with their listing counts."
            rateLimit="60/min"
            response={`[
  {
    "id": "uuid",
    "name": "Wallets & Payments",
    "slug": "wallets-payments",
    "description": "AI-powered wallets...",
    "listing_count": 5
  }
]`}
          />

          <Endpoint
            method="GET"
            path="/api/tags"
            description="Retrieve all tags with their listing counts."
            rateLimit="60/min"
            response={`[
  { "id": "uuid", "name": "defi", "slug": "defi", "listing_count": 3 }
]`}
          />

          <Endpoint
            method="GET"
            path="/api/chains"
            description="Retrieve all supported chains."
            rateLimit="60/min"
            response={`[
  { "id": "uuid", "name": "CKB (Nervos)", "slug": "ckb", "is_featured": true },
  { "id": "uuid", "name": "Ethereum", "slug": "ethereum", "is_featured": false }
]`}
          />

        </div>
      </section>

      {/* Submission Status Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Submission Status</h2>
        <p className="text-theme-text-secondary text-sm mb-6">
          After submitting a listing, use these endpoints to check its review status. No authentication required.
        </p>
        <div className="space-y-6">
          <Endpoint
            method="GET"
            path="/api/submissions/search?q=:query"
            description="Search submissions by partial name or slug match (ILIKE). Returns up to 10 results, ordered by most recent. Minimum 2 characters required."
            rateLimit="60/min"
            params={[
              { name: 'q', type: 'string', desc: 'Search query, matches against listing name or slug (min 2 chars)' },
            ]}
            response={`[
  {
    "id": "uuid",
    "slug": "my-agent-tool",
    "name": "My Agent Tool",
    "status": "pending",        // "pending" | "approved" | "rejected"
    "submitted_at": "2025-01-01T00:00:00Z",
    "approved_at": null,         // set when approved
    "rejection_note": null       // set when rejected
  }
]`}
          />

          <Endpoint
            method="GET"
            path="/api/submissions/:id/status"
            description="Check the exact status of a single submission. Accepts either a UUID (returned at submission time) or the listing slug."
            rateLimit="60/min"
            response={`{
  "id": "uuid",
  "slug": "my-agent-tool",
  "name": "My Agent Tool",
  "status": "pending",
  "submitted_at": "2025-01-01T00:00:00Z",
  "approved_at": null,
  "rejection_note": null
}`}
          />
        </div>
      </section>


      {/* Error Format */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Error Responses</h2>
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <p className="text-sm text-theme-text-secondary mb-4">All errors return a consistent JSON format. POST/PATCH requests must include <code className="text-primary font-mono text-xs">Content-Type: application/json</code>.</p>
          <pre className="bg-dark-surface2 rounded-lg p-4 text-xs text-theme-text-secondary font-mono overflow-x-auto">{`{
  "error": "Not found",
  "code": "NOT_FOUND"
}`}</pre>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex gap-4"><code className="text-amber-400 w-8">400</code><span className="text-theme-text-secondary">Malformed JSON body (<code className="text-theme-text-muted">BAD_REQUEST</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">401</code><span className="text-theme-text-secondary">Unauthorized, missing or invalid admin token (<code className="text-theme-text-muted">UNAUTHORIZED</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">404</code><span className="text-theme-text-secondary">Resource not found (<code className="text-theme-text-muted">NOT_FOUND</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">422</code><span className="text-theme-text-secondary">Validation error or missing Content-Type header (<code className="text-theme-text-muted">VALIDATION</code> / <code className="text-theme-text-muted">UNPROCESSABLE</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">429</code><span className="text-theme-text-secondary">Rate limit exceeded, includes <code className="text-theme-text-muted">Retry-After</code> header (<code className="text-theme-text-muted">RATE_LIMIT</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">500</code><span className="text-theme-text-secondary">Internal server error (<code className="text-theme-text-muted">DB_ERROR</code>)</span></div>
          </div>
        </div>
      </section>

      {/* Agent Discovery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Agent Discovery</h2>
        <p className="text-theme-text-secondary text-sm mb-6">
          Agents can discover the full API surface automatically by probing these standard endpoints. No documentation handoff needed.
        </p>
        <div className="space-y-4">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <code className="font-mono text-sm font-bold shrink-0 text-code">/.well-known/agent.json</code>
            <span className="text-theme-text text-sm">Agent capabilities manifest. Lists every operation, parameters, rate limits, and auth requirements.</span>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <code className="font-mono text-sm font-bold shrink-0 text-code">/.well-known/ai-plugin.json</code>
            <span className="text-theme-text text-sm">AI plugin manifest (ChatGPT plugin format) for agents that probe this standard path.</span>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <code className="font-mono text-sm font-bold shrink-0 text-code">/api/openapi.json</code>
            <span className="text-theme-text text-sm">Full OpenAPI 3.0 spec. Any agent or tool that speaks OpenAPI can auto-generate a client from this.</span>
          </div>
        </div>
      </section>

      {/* Agent-First Note */}
      <section className="mb-12">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            Agent-First Design
          </h3>
          <p className="text-sm text-theme-text-secondary">
            This API is designed for autonomous AI agent consumption. All endpoints return structured JSON,
            use predictable pagination, and require no authentication for read operations. Agents can discover,
            filter, and retrieve listing data programmatically without browser interaction.
          </p>
        </div>
      </section>
    </main>
  );
}
