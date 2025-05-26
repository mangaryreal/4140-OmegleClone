FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files (except node_modules thanks to .dockerignore)
COPY . .

# Copy all api files
COPY ./api ./api

# Expose default Node.js port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]