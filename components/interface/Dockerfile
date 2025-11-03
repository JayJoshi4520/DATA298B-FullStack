FROM node:lts-slim AS base
WORKDIR /usr/local/app

##################################################
#                 CLIENT STAGES                  #
##################################################
FROM base AS client-base
COPY client/package* ./ 
RUN npm install
COPY client/eslint.config.js client/index.html client/vite.config.js ./ 
COPY client/public ./public
COPY client/src ./src

FROM client-base AS client-dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

FROM client-base AS client-build
RUN npm run build

##################################################
#                 API STAGES                     #
##################################################

# -----------------------------------------------
# ✅ Development server with ADK support
# -----------------------------------------------
FROM base AS server-dev

# Copy package files and install dependencies
COPY api/package* ./ 
ENV NODE_ENV=development
RUN npm install

# Install Python + ADK dependencies
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    pip install --no-cache-dir --break-system-packages google-adk google-generativeai google-genai mcp

# Copy API source code
COPY api/src ./src

# Default command for development
CMD ["npm", "run", "dev"]

# -----------------------------------------------
# ✅ Production build (with ADK support)
# -----------------------------------------------
FROM base AS server-build

# Copy and install Node dependencies
COPY api/package* ./ 
ENV NODE_ENV=production
RUN npm ci 

# Install Python + ADK for production
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    pip install --no-cache-dir --break-system-packages google-adk google-generativeai google-genai mcp

# Copy API source code and built frontend
COPY api/src ./src
COPY --from=client-build /usr/local/app/dist ./public

EXPOSE 3030
USER 1000

# Start the Node API
CMD ["node", "src/index.js"]
