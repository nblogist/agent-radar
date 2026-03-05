FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy template and built files
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

ENV PORT=3000
EXPOSE 3000

# Only substitute PORT and BACKEND_URL, leaving nginx variables ($uri, $host, etc.) intact
CMD ["/bin/sh", "-c", "envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
