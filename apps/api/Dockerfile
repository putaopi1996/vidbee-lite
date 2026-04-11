# ── Stage 1: Build ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN corepack enable

WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy lockfile and workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json files for workspace resolution
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/downloader-core/package.json packages/downloader-core/package.json

# Install all dependencies
RUN pnpm install --filter "{./apps/api}..." --frozen-lockfile

# Copy source code and build
COPY apps/api apps/api
COPY packages/db packages/db
COPY packages/downloader-core packages/downloader-core

# Build the API
RUN pnpm --filter ./apps/api run build

# ── Stage 2: Production ──────────────────────────────────────────────
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

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3100

ENV VIDBEE_API_HOST=0.0.0.0
ENV VIDBEE_API_PORT=3100
ENV VIDBEE_DOWNLOAD_DIR=/data/downloads

VOLUME ["/data/downloads"]

# Direct node execution for minimum overhead
CMD ["node", "dist/index.js"]
