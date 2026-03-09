FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Generate .well-known discovery files with the real backend URL so AI agents
# hitting the frontend domain can discover the API immediately.
RUN mkdir -p dist/.well-known && \
    printf '{\n  "schema_version": "1.0",\n  "name": "AgentRadar",\n  "description": "AI-first agent application directory for discovering and listing AI agent tools and services.",\n  "api_base": "%s",\n  "api_spec": "%s/api/openapi.json",\n  "capabilities_url": "%s/.well-known/agent.json",\n  "authentication": { "public_endpoints": "No auth required for all read endpoints and submissions" },\n  "response_format": "application/json"\n}' \
    "$VITE_API_BASE_URL" "$VITE_API_BASE_URL" "$VITE_API_BASE_URL" > dist/.well-known/agent.json && \
    printf '{\n  "schema_version": "v1",\n  "name_for_human": "AgentRadar",\n  "name_for_model": "agentradar",\n  "description_for_model": "AgentRadar is an AI agent directory. The full API is at %s — search, submit, and check status of AI agent listings. Get the OpenAPI spec at %s/api/openapi.json for complete endpoint documentation.",\n  "auth": { "type": "none" },\n  "api": { "type": "openapi", "url": "%s/api/openapi.json" }\n}' \
    "$VITE_API_BASE_URL" "$VITE_API_BASE_URL" "$VITE_API_BASE_URL" > dist/.well-known/ai-plugin.json

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /app
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
