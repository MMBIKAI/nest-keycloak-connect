# Use the official Node.js image as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src

# Copy package.json and package-lock.json to the container
COPY ../package.json ../package-lock.json ./

# Install dependencies
RUN npm install

# Copy tsconfig.json to the container (add this line)
COPY tsconfig.json ./

# Copy the application source code
COPY . ./src

# Expose the port the app runs on
EXPOSE 3006

# Command to run the application
CMD ["npm", "run", "start"]
