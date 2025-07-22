#!/bin/bash

echo "🚀 Setting up Trendulum - Taste Architect for Creators"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You'll need to install it or use Docker."
    echo "   For Docker: docker-compose up -d postgres"
fi

echo "✅ Prerequisites check completed"

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your API keys:"
    echo "   - QLOO_API_KEY: Get from https://forms.gle/K1LVBUUReabqA3wQ8"
    echo "   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys"
    echo "   - DATABASE_URL: Update with your database connection"
    echo "   - SECRET_KEY: Generate a secure random key"
fi

cd ..

# Frontend setup
echo ""
echo "🔧 Setting up Frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:8000" > .env
fi

cd ..

echo ""
echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Start the backend: cd backend && source venv/bin/activate && python main.py"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Or use Docker: docker-compose up"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🎉 Happy coding!" 