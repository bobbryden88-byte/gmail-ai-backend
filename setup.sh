#!/bin/bash

echo "🚀 Setting up Gmail AI Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Trying with --force..."
    npm install --force
fi

# Copy environment template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "⚠️  Please update .env file with your actual values:"
    echo "   - DATABASE_URL"
    echo "   - OPENAI_API_KEY"
    echo "   - JWT_SECRET"
    echo "   - STRIPE_SECRET_KEY"
else
    echo "✅ .env file already exists"
fi

# Check if Prisma is available
if command -v npx &> /dev/null; then
    echo "🗄️  Setting up database..."
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "📋 To set up your database, run:"
    echo "   npx prisma migrate dev --name init"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your actual values"
echo "2. Set up your database (PostgreSQL or SQLite)"
echo "3. Run database migrations: npx prisma migrate dev --name init"
echo "4. Start the server: npm run dev"
echo ""
echo "Test the API: node test-api.js"
