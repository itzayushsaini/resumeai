# syntax=docker/dockerfile:1

# ---------- Build: install everything and bundle the React client ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- Runtime: Node plus Chromium for PDF export ----------
FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium fonts-liberation ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    CHROME_PATH=/usr/bin/chromium \
    PORT=10000

WORKDIR /app
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/shared/package.json ./shared/
COPY --from=build --chown=node:node /app/shared/src ./shared/src
COPY --from=build --chown=node:node /app/server/package.json ./server/
COPY --from=build --chown=node:node /app/server/src ./server/src
COPY --from=build --chown=node:node /app/client/dist ./client/dist

USER node
EXPOSE 10000
CMD ["node", "server/src/index.js"]
