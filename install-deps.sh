#!/bin/bash

echo "Installing dependencies..."

# Kill any existing npm processes
pkill -f npm 2>/dev/null || true

# Wait a moment
sleep 2

# Clear npm cache
npm cache clean --force

# Remove existing files
rm -rf node_modules package-lock.json

# Install dependencies
npm install express cors dotenv jsonwebtoken bcryptjs openai stripe prisma @prisma/client express-rate-limit helmet

# Install dev dependencies
npm install -D nodemon

echo "Dependencies installed successfully!"
