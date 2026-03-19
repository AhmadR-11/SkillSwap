# --- STAGE 1: Build the React App ---
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code and build it
COPY . .
RUN npm run build

# --- STAGE 2: Serve the App using Nginx ---
FROM nginx:alpine

# Copy the built files from Stage 1 into the Nginx web server folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (the default Nginx port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
