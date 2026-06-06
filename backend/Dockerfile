# Stage 1: Build
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production
RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN addgroup --gid 1001 --system nodejs && adduser --system --uid 1001 nodejs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1
CMD ["node", "dist/index.js"]
