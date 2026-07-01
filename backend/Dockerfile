# ---- deps stage: install only production dependencies ----
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /usr/src/app

# Run as a non-root user instead of the default root, so a container
# compromise doesn't hand over root inside the container for free.
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000
CMD ["node", "src/server.js"]
