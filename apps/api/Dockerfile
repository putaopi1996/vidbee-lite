# ── Stage 1: Build ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/downloader-core/package.json packages/downloader-core/package.json

RUN pnpm install --filter "{./apps/api}..." --frozen-lockfile

# Copy source and build
COPY apps/api apps/api
COPY packages/db packages/db
COPY packages/downloader-core packages/downloader-core

RUN pnpm --filter ./apps/api run build

# ── Stage 2: Production ──────────────────────────────────────────────
FROM node:20-alpine

ENV YTDLP_PATH=/usr/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production

# Install runtime dependencies only (fetch absolute latest yt-dlp)
RUN apk add --no-cache ffmpeg python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/bin/yt-dlp && \
    chmod a+rx /usr/bin/yt-dlp

WORKDIR /app

# Copy only the bundled output and required workspace packages
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/resources ./resources
COPY --from=builder /app/apps/api/package.json ./package.json

# We need the node_modules because of native modules (better-sqlite3)
# But we can prune them to production only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3100

ENV VIDBEE_API_HOST=0.0.0.0
ENV VIDBEE_API_PORT=3100
ENV VIDBEE_DOWNLOAD_DIR=/data/downloads

VOLUME ["/data/downloads"]

# Direct node execution for minimum overhead
CMD ["node", "dist/index.js"]
