FROM node:23.11.0-alpine AS base

# Stage 1 : Install All Depedency
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2 : Building Application
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV STANDALONE_MODE=true
RUN npm run build

# Stage 3 : Production Server
FROM base AS runner

RUN addgroup -g 1050 jogjanavigator \ 
  && adduser -u 1050 -G jogjanavigator -s /bin/sh -D jogjanavigator

WORKDIR /app
ENV NODE_ENV=production

COPY --chown=jogjanavigator:jogjanavigator --from=build /app/public ./public
COPY --chown=jogjanavigator:jogjanavigator --from=build /app/.next/standalone ./
COPY --chown=jogjanavigator:jogjanavigator --from=build /app/.next/static ./.next/static

# Running
EXPOSE 3000
CMD ["node", "server.js"]