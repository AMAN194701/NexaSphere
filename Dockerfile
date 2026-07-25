<<<<<<< HEAD
# Stage 1: Build the React application
FROM node:22-alpine AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy package files for dependency resolution
COPY package*.json ./
COPY website/package.json ./website/
COPY admin-dashboard/package.json ./admin-dashboard/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine AS production

RUN apk update && apk upgrade --no-cache

# Copy the build output from the builder stage
COPY --from=builder /app/website/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
=======
# Stage 1: Build dependencies and assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present

# Stage 2: Production release container
FROM node:18-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
>>>>>>> origin/pr/539
