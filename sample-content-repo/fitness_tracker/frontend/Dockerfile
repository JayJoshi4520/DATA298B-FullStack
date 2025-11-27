# Stage 1: Build the Vue.js application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built static files from the 'builder' stage to the Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]