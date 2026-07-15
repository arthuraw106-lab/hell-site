# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

ENV npm_config_audit=false
ENV npm_config_fund=false
ENV npm_config_fetch_retries=5
ENV npm_config_fetch_retry_mintimeout=20000
ENV npm_config_fetch_retry_maxtimeout=120000

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]