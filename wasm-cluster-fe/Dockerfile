# Use Node.js 20 base image
FROM node:20.17-alpine

# Set the working directory
WORKDIR /frontend

# Copy the source Code to working directory
COPY src ./src
COPY public ./public
COPY .env ./.env
COPY *.json ./

# Install dependencies
RUN npm ci

# Build the Next.js app
RUN npm run build

# Command to run the app
CMD ["npm", "run", "start"]

# Expose the port the app runs on
EXPOSE 4000
