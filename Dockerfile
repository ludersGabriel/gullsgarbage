# syntax=docker/dockerfile:1
# Multi-stage build. Stage names mirror the build targets referenced by
# docker-compose.yml (runner) — keep them in sync.
#
# Usage:
#   docker compose up -d --build
#
# No migrator stage: the app has no database, so there is nothing to migrate.

FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/.output ./.output
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
