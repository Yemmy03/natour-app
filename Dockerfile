# --------> Stage 1: Builder <--------
FROM node:18-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

# Install ALL dependencies (dev + prod) for building
RUN npm install

COPY . .

# --------> Stage 2: Runtime <--------
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy built source code from builder
COPY --from=builder /usr/src/app/ ./


EXPOSE 3000
ENTRYPOINT ["node", "index.js"]

