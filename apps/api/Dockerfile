# ── Stage 1: Build (Native Platform) ──────────────────────────────────
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable

WORKDIR /app

# 1. Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 2. Copy all EXISTING package.json files from the workspace (required for pnpm validation)
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/downloader-core/package.json packages/downloader-core/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/ui/package.json packages/ui/package.json

# 3. Install dependencies (native x64 platform for speed and stability)
RUN pnpm install --filter "{./apps/api}..." --frozen-lockfile --ignore-scripts

# 4. Copy source code and build
COPY apps/api apps/api
COPY packages/db packages/db
COPY packages/downloader-core packages/downloader-core

RUN pnpm --filter ./apps/api run build

# ── Stage 2: Prod-deps (Target Platform) ──────────────────────────────
FROM node:20-alpine AS prod-deps

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable

WORKDIR /app

# Install build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy same set of package.json files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/downloader-core/package.json packages/downloader-core/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/ui/package.json packages/ui/package.json

# Install production dependencies only (under emulation).
# Disable husky in containers, but keep package install scripts enabled
# so native modules like better-sqlite3 can still build/install.
RUN HUSKY=0 pnpm install --filter "{./apps/api}..." --prod --frozen-lockfile

# ── Stage 3: Production ──────────────────────────────────────────────
FROM node:20-alpine

ENV YTDLP_PATH=/usr/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production

# Install runtime dependencies (fetch latest yt-dlp)
RUN apk add --no-cache ffmpeg python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/bin/yt-dlp && \
    chmod a+rx /usr/bin/yt-dlp

WORKDIR /app

# Copy output from builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/resources ./resources
COPY --from=builder /app/apps/api/package.json ./package.json

# Copy pruned node_modules from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3100

ENV VIDBEE_API_HOST=0.0.0.0
ENV VIDBEE_API_PORT=3100
ENV VIDBEE_DOWNLOAD_DIR=/data/downloads

VOLUME ["/data/downloads"]

# Direct node execution for minimum overhead
CMD ["node", "dist/index.js"]
