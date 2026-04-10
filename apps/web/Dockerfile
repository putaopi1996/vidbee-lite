# ── Stage 1: Build static assets ──────────────────────────────────────
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable

WORKDIR /app

# Optional: bake VITE_API_URL at build time.
# Leave empty (default) to use same-origin requests via nginx reverse proxy.
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies (lockfile-only layer for Docker cache)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/downloader-core/package.json packages/downloader-core/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN pnpm install --filter "{./apps/web}..." --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/web apps/web
COPY packages/downloader-core packages/downloader-core
COPY packages/i18n packages/i18n
COPY packages/ui packages/ui

# Build static files into apps/web/dist
RUN pnpm --filter ./apps/web run build

# ── Stage 2: Serve with nginx (~7 MB image) ──────────────────────────
FROM nginx:alpine

RUN apk update && apk add --no-cache apache2-utils

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/99-auth.sh /docker-entrypoint.d/99-auth.sh
RUN chmod +x /docker-entrypoint.d/99-auth.sh

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
