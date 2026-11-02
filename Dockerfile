# syntax=docker/dockerfile:1

# Production-ready, multi-stage image for Linkbase (Next.js 16 standalone output).
#
# Vercel does NOT build from this file — it builds the prebuilt output produced
# in CI (see .github/workflows/ci.yml). This image is for running the app as a
# container anywhere else and for reproducible, local production-parity builds.
# Keep NODE_VERSION in lockstep with the CI container base in the workflow.

ARG NODE_VERSION=22-bookworm-slim

# ---- base -------------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps: install dependencies against the committed lockfile --------------
FROM base AS deps
# Copy only manifests first so this layer caches unless dependencies change.
# .npmrc carries the install flags (see repo root) so npm ci resolves the same
# way here as in CI and on Vercel.
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- builder: produce the standalone server --------------------------------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time PLACEHOLDERS only. Some server modules validate required env at
# import time (e.g. lib/db/index.ts throws if MONGODB_URI is unset), and
# `next build` evaluates them while collecting page data. These dummy values
# satisfy those guards so the build completes. They are confined to this stage
# — the runner stage does NOT carry them — and are never used at runtime: the
# standalone server reads the container's real env at startup (§6 of
# docs/deployment.md). No NEXT_PUBLIC_* vars exist, so nothing here is inlined
# into the client bundle. Set inline on the RUN so they live only for that
# process and never persist in an image layer (also avoids Docker's
# SecretsUsedInArgOrEnv lint on ENV/ARG).
RUN MONGODB_URI="mongodb://placeholder:27017/build" \
    AUTH_SECRET="build-time-placeholder-not-used-at-runtime" \
    npm run build

# ---- runner: minimal, non-root runtime image -------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# `.next/standalone` ships its own minimal node_modules + server.js. The public
# and .next/static folders are not included by standalone, so copy them in.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Run as the unprivileged `node` user that ships with the official image.
USER node

EXPOSE 3000

# Lenient health check: any HTTP response (even an auth redirect) means the
# server is up. Node 22 provides a global fetch().
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
