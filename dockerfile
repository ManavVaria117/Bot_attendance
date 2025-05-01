# Use official Node image
FROM node:18

# Install Chromium for Puppeteer
RUN apt-get update && apt-get install -y chromium

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Set Puppeteer executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Start your script
CMD ["node", "patch.js"]
