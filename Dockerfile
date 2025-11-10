FROM node:22

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy server code
COPY server.js .
COPY database.js .
COPY index.js .

# Copy public directory
COPY public ./public

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
