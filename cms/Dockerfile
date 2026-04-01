FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ── Build admin panel ──
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ── Production image ──
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY . .

EXPOSE 1337
CMD ["npm", "run", "start"]
