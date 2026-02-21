FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with force flag to resolve conflicts
RUN npm install --force

# Copy public and src
COPY public ./public
COPY src ./src
COPY tsconfig.json tailwind.config.js ./

# Expose port
EXPOSE 3000

# Start dev server
CMD ["npm", "start"]
