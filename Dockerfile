# Frontend Dockerfile for Static Web Hosting
# Multi-stage build: Build stage + Nginx stage
# Note: Vercel doesn't use Dockerfiles, but this is useful for other deployments

# Stage 1: Build the web application
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and configuration
COPY . .

# Build the web application
# This creates static files in the 'dist' directory
RUN npm run build:web

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner

# Copy custom nginx configuration (optional)
# If you have a custom nginx config, uncomment the next line
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /static { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

