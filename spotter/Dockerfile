# SPOTTER: web server + in-process worker.
#
#   docker compose up -d --build        (see docker-compose.yml)
#
# Secrets are never baked into the image: they come from the environment at
# run time (.env via docker compose, or your host's settings).
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Build, then drop build-only tooling (compilers, linters, test runners) from what ships.
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
# tsx is a runtime dependency, so `npm run worker` / `npm run collect` work in the same image.
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
