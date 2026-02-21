FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code (includes validation schemas)
COPY src ./src

# Expose port
EXPOSE 5000

# Start server using tsx (TypeScript runner)
CMD ["npx", "tsx", "src/index.ts"]
