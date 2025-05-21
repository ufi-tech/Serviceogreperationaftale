# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY package-lock.json ./
# If you were using yarn, you would copy yarn.lock instead:
# COPY yarn.lock ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Make port 3000 available to the world outside this container
# React app usually runs on port 3000 by default
EXPOSE 3000

# Set environment variable for hot reloading in Docker
ENV CHOKIDAR_USEPOLLING=true

# Command to run the app
CMD ["npm", "start"]
