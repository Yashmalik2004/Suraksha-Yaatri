#!/bin/bash

echo "🚀 Suraksha Yaatri - Quick Start Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create environment files if they don't exist
echo "📝 Setting up environment files..."
node setup_env.js

# Install dependencies
echo "📦 Installing dependencies..."
npm run setup

# Set up database
echo "🗄️ Setting up database..."
read -p "Enter MySQL root password: " -s mysql_password
echo
mysql -u root -p$mysql_password < setup_database.sql

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Frontend: npm run dev"
echo "2. Backend: npm run start:backend"
echo "3. AI Detection: npm run start:ai"
echo ""
echo "Visit http://localhost:8080 to see the application!"

