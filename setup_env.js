#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Suraksha Yaatri environment...\n');

// Create frontend .env file
const frontendEnv = `# Frontend Environment Variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_BASE=http://localhost:5000
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Development settings
VITE_NODE_ENV=development`;

// Create backend .env file
const backendEnv = `# Backend Environment Variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yashu04@pass
DB_NAME=suraksha_yaatri
PORT=5000

# Twilio Configuration (for SMS alerts)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5173`;

try {
  // Create frontend .env
  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', frontendEnv);
    console.log('✅ Created .env file for frontend');
  } else {
    console.log('⚠️  Frontend .env already exists, skipping...');
  }

  // Create backend .env
  if (!fs.existsSync('backend/.env')) {
    fs.writeFileSync('backend/.env', backendEnv);
    console.log('✅ Created backend/.env file');
  } else {
    console.log('⚠️  Backend .env already exists, skipping...');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Update the API keys in .env files');
  console.log('2. Set up MySQL database: npm run setup:db');
  console.log('3. Install dependencies: npm run setup');
  console.log('4. Start the application: npm run dev');
  console.log('\n🎉 Environment setup complete!');

} catch (error) {
  console.error('❌ Error setting up environment:', error.message);
  process.exit(1);
}

