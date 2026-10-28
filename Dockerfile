# Build the Frontend [dist folder]
FROM node:22-alpine as frontend-builder

WORKDIR /app

# Copy package files first for better layer caching
COPY ./frontend/package*.json ./

RUN npm ci

# Copy the rest of the frontend source code
COPY ./frontend .

RUN npm run build


# Build the Backend
FROM node:22-alpine

WORKDIR /app

# Copy backend package files first for better layer caching
COPY ./backend/package*.json ./

# Install production dependencies (make sure dotenv is in dependencies in your backend package.json!)
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY ./backend .

# Copy the built frontend 'dist' folder into the backend's 'public' directory
COPY --from=frontend-builder /app/dist /app/public

# Start the server using the correct entrypoint path
CMD ["node", "src/server.js"]