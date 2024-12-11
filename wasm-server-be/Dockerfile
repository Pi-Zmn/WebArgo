# Use Node.js 20 base image
FROM node:20.17-alpine

# Set the working directory
WORKDIR /backend

# Copy the source Code to working directory
COPY src ./src
COPY wasm ./wasm
COPY *.json ./

# Install dependencies
RUN npm ci

# Build the Nest.js app
RUN npm run build

# Command to run the app
CMD ["npm", "run", "start:prod"]

# Expose the port the app runs on
EXPOSE 3000 3001
