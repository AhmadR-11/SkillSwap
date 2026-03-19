# 1. Use the official Node.js image as a base (it comes with Node & npm installed)
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the package.json and package-lock.json first
COPY package*.json ./

# 4. Install the dependencies inside the container
RUN npm install

# 5. Copy the rest of your backend code into the container
COPY . .

# 6. Expose the port your Express app runs on (Assuming it's 5000 based on common patterns)
EXPOSE 5000

# 7. Start the application

CMD ["node", "server.js"]
