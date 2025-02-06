# Base image with Node and pnpm installed
FROM node:20-alpine

RUN apk update

RUN apk add --no-cache openssl
# RUN apk add libssl1.1

#RUN apk add --no-cache libssl1.1
    
# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only the relevant files
COPY . .

# Install dependencies for the API service
RUN pnpm install

# Build the project
RUN pnpm build || true  # Adjust as necessary based on your build scripts

# Run Database Migration
#RUN npx prisma migrate dev
RUN npx prisma generate

# expose port 3001 to tell Docker that the container listens on the specified network ports at runtime
EXPOSE 3001

# Set the command to start the server
CMD ["pnpm", "start"]
