# Production Dockerfile for Cave Companions Cloud Run Deployment
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json tsconfig.json vite.config.ts ./
COPY build-server.js convert-icons.js copy-assets.js ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --no-audit --maxsockets 5 || npm install --no-audit

# Copy source code and static assets
COPY public ./public
COPY src ./src
COPY server ./server
COPY server.ts ./
COPY index.html ./

# Build production assets (Vite client + bundled server.cjs + fonts + icons)
RUN npm run build

# Prune dev dependencies for a lightweight production image
RUN npm prune --production

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV TRUST_PROXY=1

# Install fonts/certificates if required
RUN apk add --no-cache ca-certificates

# Copy production artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server/assets ./server/assets

# Expose port 3000 (Standard Cloud Run Ingress Port)
EXPOSE 3000

# Start compiled CommonJS server
CMD ["node", "dist/server.cjs"]
