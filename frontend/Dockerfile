# ============================================
# Stage 1: Build Angular application
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Build arguments
ARG API_URL=http://localhost:3000
ARG PRODUCTION=false

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy entire application
COPY . .

# Build Angular app
RUN npm run build -- --configuration production

# ============================================
# Stage 2: Nginx runtime
# ============================================
FROM nginx:1.24-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Set default environment variables
ENV ANGULAR_API_URL=http://localhost:3000
ENV ANGULAR_PRODUCTION=false
ENV ANGULAR_API_TIMEOUT=30000
ENV ANGULAR_LOG_LEVEL=info

# Copy built application from the correct dist path
COPY --from=build /app/dist/jpmcbank/* /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy environment config script
COPY config/config.template.json /usr/share/nginx/html/config.template.json
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Use entrypoint to substitute environment variables
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
