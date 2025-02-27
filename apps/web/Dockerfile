# Base image with Node and pnpm installed
FROM node:20-alpine

RUN apk update

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only the relevant files
COPY . .


# Install dependencies for the API service
RUN pnpm install

# Build the project
# Adjust as necessary based on your build scripts
RUN pnpm build 

# expose port 3001 to tell Docker that the container listens on the specified network ports at runtime
EXPOSE 3000

# Set the command to start the server
CMD ["pnpm", "start"]


