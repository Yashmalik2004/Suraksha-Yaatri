@echo off
echo 🚀 Suraksha Yaatri - Quick Start Script
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed. Please install MySQL first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Create environment files if they don't exist
echo 📝 Setting up environment files...
node setup_env.js

REM Install dependencies
echo 📦 Installing dependencies...
npm run setup

REM Set up database
echo 🗄️ Setting up database...
echo Please enter your MySQL root password when prompted:
mysql -u root -p < setup_database.sql

echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Frontend: npm run dev
echo 2. Backend: npm run start:backend
echo 3. AI Detection: npm run start:ai
echo.
echo Visit http://localhost:8080 to see the application!
pause

