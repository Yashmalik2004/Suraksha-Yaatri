# Suraksha Yaatri - Quick Start Script (PowerShell)
Write-Host "🚀 Suraksha Yaatri - Quick Start Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if MySQL is installed
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL found" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL is not installed. Please install MySQL first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green

# Create environment files if they don't exist
Write-Host "📝 Setting up environment files..." -ForegroundColor Yellow
node setup_env.js

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm run setup

# Set up database
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
$mysqlPassword = Read-Host "Enter MySQL root password" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword))
mysql -u root -p$mysqlPasswordPlain < setup_database.sql

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Frontend: npm run dev" -ForegroundColor White
Write-Host "2. Backend: npm run start:backend" -ForegroundColor White
Write-Host "3. AI Detection: npm run start:ai" -ForegroundColor White
Write-Host ""
Write-Host "Visit http://localhost:8080 to see the application!" -ForegroundColor Cyan
Read-Host "Press Enter to exit"

