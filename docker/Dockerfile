# Multi-Stage Dockerfile cho Next.js Web App

FROM node:24-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.5.2
WORKDIR /app

# Stage 1: Prune các packages không cần thiết cho target app
FROM base AS pruner
ARG APP_NAME=@cardealer/web
COPY . .
RUN pnpm dlx turbo prune ${APP_NAME} --docker

# Stage 2: Cài đặt dependencies (tận dụng Docker caching layer)
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=${APP_NAME}

# Stage 3: Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=installer /app .

USER nextjs
EXPOSE 3002
ENV PORT=3002

CMD ["pnpm", "--filter", "@cardealer/web", "start"]
