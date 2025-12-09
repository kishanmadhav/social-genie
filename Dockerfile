# ===========================================
# SOCIAL GENIE - MULTI-SERVICE DOCKERFILE
# ===========================================
# This Dockerfile can build both backend and frontend
# Use build arguments to specify which service to build

ARG SERVICE=backend

# ===========================================
# BACKEND BUILD
# ===========================================
FROM node:18-alpine AS backend-deps
WORKDIR /app
COPY apps/backend/package.json ./
RUN npm install --production

FROM node:18-alpine AS backend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-deps /app/node_modules ./node_modules
COPY apps/backend/server.js ./
COPY apps/backend/database.js ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "server.js"]

# ===========================================
# FRONTEND BUILD
# ===========================================
FROM node:18-alpine AS frontend-deps
WORKDIR /app
COPY apps/frontend/package.json ./
RUN npm install

FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY apps/frontend/ ./
RUN npm run build

FROM node:18-alpine AS frontend
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

# ===========================================
# FINAL STAGE SELECTION
# ===========================================
FROM ${SERVICE} AS final
