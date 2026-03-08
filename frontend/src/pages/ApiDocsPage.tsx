import { Link } from 'react-router-dom';
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
    GET: 'bg-emerald-500/10 text-emerald-400',
    POST: 'bg-blue-500/10 text-blue-400',
    PATCH: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center gap-3">
        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm text-white font-mono">{path}</code>
        {rateLimit && (
          <span className="ml-auto text-xs text-slate-500">{rateLimit}</span>
        )}
      </div>
      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-slate-400">{description}</p>

        {params && params.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Query Parameters</h5>
            <div className="space-y-1">
              {params.map(p => (
                <div key={p.name} className="flex gap-3 text-sm">
                  <code className="text-primary font-mono text-xs shrink-0">{p.name}</code>
                  <span className="text-slate-600 text-xs shrink-0">({p.type})</span>
                  <span className="text-slate-400 text-xs">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {body && (
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Request Body</h5>
            <pre className="bg-slate-950 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">{body}</pre>
          </div>
        )}

        <div>
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Response</h5>
          <pre className="bg-slate-950 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">{response}</pre>
        </div>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-12">
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
        <Link className="text-slate-500 hover:text-primary transition-colors" to="/">Home</Link>
        <span className="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">API Documentation</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">API Documentation</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          {APP_NAME} provides a RESTful API for discovering and submitting listings — agents, tools, protocols, and infrastructure.
          All responses are JSON. The base URL is <code className="text-primary font-mono text-sm">{baseUrl}/api</code>.
        </p>
      </div>

      {/* Rate Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Read endpoints (GET)</p>
              <p className="text-lg font-bold">60 requests / minute</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Submit endpoint (POST)</p>
              <p className="text-lg font-bold">30 requests / hour</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Rate limits are per IP address. Exceeding the limit returns <code className="text-slate-400">429 Too Many Requests</code>.</p>
        </div>
      </section>

      {/* CORS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">CORS</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-3">
            All API endpoints support Cross-Origin Resource Sharing (CORS) with permissive defaults for agent-first access.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-4"><code className="text-primary font-mono text-xs shrink-0">Access-Control-Allow-Origin</code><span className="text-slate-400">*</span></div>
            <div className="flex gap-4"><code className="text-primary font-mono text-xs shrink-0">Access-Control-Allow-Methods</code><span className="text-slate-400">GET, POST, PATCH, DELETE, OPTIONS</span></div>
            <div className="flex gap-4"><code className="text-primary font-mono text-xs shrink-0">Access-Control-Allow-Headers</code><span className="text-slate-400">Content-Type, Authorization</span></div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Browser-based agents and cross-origin API consumers can call all endpoints without proxy configuration.</p>
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
            description="Submit a new listing for review. The listing will be set to 'pending' status until an admin approves it."
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
  "contact_email": "you@email.com",  // required
  "categories": ["uuid", "uuid"],    // required, min 1 category UUID
  "tags": ["ai-agent", "defi"],      // optional, lowercase alphanumeric + hyphens
  "chains": ["uuid"],                // optional, chain UUIDs
  "suggested_chains": ["New Chain"]  // optional, suggest chains not yet listed
}`}
            response={`{
  "id": "uuid",
  "slug": "my-agent-tool",
  "status": "pending",
  "submitted_at": "2025-01-01T00:00:00Z"
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

      {/* Authenticated Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Authenticated Endpoints</h2>
        <p className="text-slate-400 text-sm mb-6">These endpoints require an <code className="text-primary font-mono text-xs">Authorization: Bearer &lt;token&gt;</code> header.</p>
        <div className="space-y-6">
          <Endpoint
            method="PATCH"
            path="/api/listings/:id/reputation"
            description="Update the reputation score for a listing. Requires admin authentication via Bearer token."
            body={`{
  "score": 85.5  // 0.00 - 100.00
}`}
            response={`{
  "id": "uuid",
  "reputation_score": 85.5,
  "message": "Reputation score updated"
}`}
          />
        </div>
      </section>

      {/* Error Format */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Error Responses</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-4">All errors return a consistent JSON format. POST/PATCH requests must include <code className="text-primary font-mono text-xs">Content-Type: application/json</code>.</p>
          <pre className="bg-slate-950 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">{`{
  "error": "Not found",
  "code": "NOT_FOUND"
}`}</pre>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex gap-4"><code className="text-amber-400 w-8">400</code><span className="text-slate-400">Malformed JSON body (<code className="text-slate-500">BAD_REQUEST</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">401</code><span className="text-slate-400">Unauthorized — missing or invalid admin token (<code className="text-slate-500">UNAUTHORIZED</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">404</code><span className="text-slate-400">Resource not found (<code className="text-slate-500">NOT_FOUND</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">422</code><span className="text-slate-400">Validation error or missing Content-Type header (<code className="text-slate-500">VALIDATION</code> / <code className="text-slate-500">UNPROCESSABLE</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">429</code><span className="text-slate-400">Rate limit exceeded — includes <code className="text-slate-500">Retry-After</code> header (<code className="text-slate-500">RATE_LIMIT</code>)</span></div>
            <div className="flex gap-4"><code className="text-amber-400 w-8">500</code><span className="text-slate-400">Internal server error (<code className="text-slate-500">DB_ERROR</code>)</span></div>
          </div>
        </div>
      </section>

      {/* Agent Discovery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Agent Discovery</h2>
        <p className="text-slate-400 text-sm mb-6">
          Agents can discover the full API surface automatically by probing these standard endpoints — no documentation handoff needed.
        </p>
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <code className="text-primary font-mono text-sm shrink-0">/.well-known/agent.json</code>
            <span className="text-slate-400 text-sm">Agent capabilities manifest — lists every operation, parameters, rate limits, and auth requirements.</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <code className="text-primary font-mono text-sm shrink-0">/.well-known/ai-plugin.json</code>
            <span className="text-slate-400 text-sm">AI plugin manifest (ChatGPT plugin format) for agents that probe this standard path.</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <code className="text-primary font-mono text-sm shrink-0">/api/openapi.json</code>
            <span className="text-slate-400 text-sm">Full OpenAPI 3.0 spec — any agent or tool that speaks OpenAPI can auto-generate a client from this.</span>
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
          <p className="text-sm text-slate-400">
            This API is designed for autonomous AI agent consumption. All endpoints return structured JSON,
            use predictable pagination, and require no authentication for read operations. Agents can discover,
            filter, and retrieve listing data programmatically without browser interaction.
          </p>
        </div>
      </section>
    </main>
  );
}
