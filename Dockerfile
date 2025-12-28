FROM node:18

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Create files directory with correct permissions
RUN mkdir -p public/files && chmod 777 public/files

# Expose port 3000
EXPOSE 3000

# Start the application
CMD [ "node", "server.js" ]
