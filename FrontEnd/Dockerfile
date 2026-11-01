# ==============================================================================
# Stage 1: Dependency Installation & Compilation (Builder)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm ci || npm install --no-audit

# Copy source code, static assets, and configuration files
COPY vite.config.js tailwind.config.js postcss.config.js index.html seller.html ./
COPY public ./public
COPY src ./src

# Compile and bundle assets (HTML, Tailwind CSS, JS chunks, and self-hosted fonts)
RUN npm run build

# ==============================================================================
# Stage 2: Development Container (Optional target for live hot-reloading)
# ==============================================================================
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
ENV HOST=0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==============================================================================
# Stage 3: High-Performance Production Runner (Hardened Nginx)
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom high-performance, security-hardened Nginx configuration template
ENV BACKEND_URL=http://host.docker.internal:8000
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure the web server is answering requests
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
