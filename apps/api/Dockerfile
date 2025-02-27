# Base image with Node and pnpm installed
FROM node:20-alpine

RUN apk update && apk add --no-cache \
    openssl \
    python3 \
    make \
    g++ \
    openssl-dev \
    gcc
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

RUN cd node_modules/bcrypt && npm rebuild bcrypt --build-from-source

# Generate prisma client
RUN npx prisma generate

# Build the project
# Adjust as necessary based on your build scripts
RUN pnpm build

# Run Database Migration
#RUN npx prisma migrate dev

# expose port 3001 to tell Docker that the container listens on the specified network ports at runtime
EXPOSE 3001

# Set the command to start the server
CMD ["pnpm", "start"]
