FROM node:18-alpine

WORKDIR /app

# Copy package definition
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose Vite default port (configured to 3000)
EXPOSE 4000

# Start development server
CMD ["npm", "run", "dev"]
