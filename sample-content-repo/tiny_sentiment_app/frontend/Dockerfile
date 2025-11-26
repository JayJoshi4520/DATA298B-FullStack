FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Expose Vite default port
EXPOSE 4000

# Bind to 0.0.0.0 to make it accessible outside container
CMD ["npm", "run", "dev", "--", "--host"]