# Use the official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy the rest of your app
COPY . .

# Cloud Run sets PORT automatically; provide default just in case
ENV PORT 8080
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]
