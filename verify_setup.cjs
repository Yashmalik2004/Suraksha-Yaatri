// Verification script for Suraksha Yaatri setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Suraksha Yaatri setup...\n');

let allGood = true;

// Check if required files exist
const requiredFiles = [
  '.env',
  'backend/.env',
  'ai/requirements.txt',
  'setup_database.sql',
  'src/index.css',
  'backend/config.js',
  'package.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check environment variables
console.log('\n🔧 Checking environment variables...');

// Check frontend .env
if (fs.existsSync('.env')) {
  const frontendEnv = fs.readFileSync('.env', 'utf8');
  const requiredFrontendVars = ['VITE_GOOGLE_MAPS_API_KEY', 'VITE_API_BASE', 'VITE_CONTRACT_ADDRESS'];
  
  requiredFrontendVars.forEach(varName => {
    if (frontendEnv.includes(varName)) {
      console.log(`✅ Frontend: ${varName}`);
    } else {
      console.log(`❌ Frontend: ${varName} - MISSING`);
      allGood = false;
    }
  });
}

// Check backend .env
if (fs.existsSync('backend/.env')) {
  const backendEnv = fs.readFileSync('backend/.env', 'utf8');
  const requiredBackendVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT'];
  
  requiredBackendVars.forEach(varName => {
    if (backendEnv.includes(varName)) {
      console.log(`✅ Backend: ${varName}`);
    } else {
      console.log(`❌ Backend: ${varName} - MISSING`);
      allGood = false;
    }
  });
}

// Check CSS variables
console.log('\n🎨 Checking CSS variables...');
if (fs.existsSync('src/index.css')) {
  const cssContent = fs.readFileSync('src/index.css', 'utf8');
  const requiredCssVars = [
    '--sidebar-background',
    '--sidebar-foreground',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-border',
    '--sidebar-ring'
  ];
  
  requiredCssVars.forEach(varName => {
    if (cssContent.includes(varName)) {
      console.log(`✅ CSS: ${varName}`);
    } else {
      console.log(`❌ CSS: ${varName} - MISSING`);
      allGood = false;
    }
  });
}

// Check database configuration
console.log('\n🗄️ Checking database configuration...');
if (fs.existsSync('backend/config.js')) {
  const configContent = fs.readFileSync('backend/config.js', 'utf8');
  if (configContent.includes("database: process.env.DB_NAME || 'suraksha_yaatri'")) {
    console.log('✅ Database name configured correctly');
  } else {
    console.log('❌ Database name not configured correctly');
    allGood = false;
  }
}

// Check AI requirements
console.log('\n🤖 Checking AI requirements...');
if (fs.existsSync('ai/requirements.txt')) {
  const requirements = fs.readFileSync('ai/requirements.txt', 'utf8');
  const requiredPackages = ['ultralytics', 'opencv-python', 'python-socketio', 'requests', 'numpy', 'torch'];
  
  requiredPackages.forEach(pkg => {
    if (requirements.includes(pkg)) {
      console.log(`✅ AI: ${pkg}`);
    } else {
      console.log(`❌ AI: ${pkg} - MISSING`);
      allGood = false;
    }
  });
}

// Final result
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 All checks passed! Your setup is ready.');
  console.log('\n📋 Next steps:');
  console.log('1. Update API keys in .env files');
  console.log('2. Set up MySQL database: npm run setup:db');
  console.log('3. Install dependencies: npm run setup');
  console.log('4. Start the application: npm run dev');
} else {
  console.log('❌ Some issues found. Please fix them before proceeding.');
  console.log('\n📋 Check the missing items above and run this script again.');
}
console.log('='.repeat(50));
