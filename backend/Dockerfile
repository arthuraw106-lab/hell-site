# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

RUN npx prisma generate

FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json* ./
COPY --from=deps /app/prisma ./prisma

COPY tsconfig*.json ./
COPY nest-cli.json* ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN npx prisma generate

EXPOSE 4000

CMD ["node", "dist/main.js"]