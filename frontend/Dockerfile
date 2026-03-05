FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine
RUN npm install -g serve
COPY --from=builder /app/dist /app
EXPOSE 3000
CMD ["serve", "-s", "/app", "-l", "3000"]
