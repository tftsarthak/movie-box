# Build the Frontend [dist folder]
FROM node:22-alpine as frontend-builder

WORKDIR /app

# Copy package files first for better layer caching
COPY ./frontend/package*.json ./

RUN npm ci

# Copy the rest of the frontend source code
COPY ./frontend .



# Build arguments for frontend production build -- included as .env is in .dockerignore
# 1. ARG = "Door" to accept values passed during docker build (e.g. from GitHub Actions)
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_AUTHORITY
ARG VITE_COGNITO_DOMAIN

# 2. ENV = Makes that value available in the terminal for Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID
ENV VITE_COGNITO_AUTHORITY=$VITE_COGNITO_AUTHORITY
ENV VITE_COGNITO_DOMAIN=$VITE_COGNITO_DOMAIN

# 3. Now Vite can read them when building!
RUN npm run build

# Without ARG / ENV ---> .dockerignore blocks .env → Vite finds no variables during build → Variables become undefined or fall back to local dev values.
# With ARG / ENV ---> GitHub Actions injects your production Cognito and API variables into Docker at build time → Vite bakes the correct production settings into the final website files.


# Build the Backend
FROM node:22-alpine

WORKDIR /app

# Copy backend package files first for better layer caching
COPY ./backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY ./backend .

# Copy the built frontend 'dist' folder into the backend's 'public' directory
COPY --from=frontend-builder /app/dist /app/public

# Start the server using the correct entrypoint path
CMD ["node", "src/server.js"]
