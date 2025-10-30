const { exec } = require('child_process');
const path = require('path');

console.log(" Starting Suraksha Yaatri Backend...\n");

console.log("1️⃣ Testing database connection...");
exec('node test_db.js', (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Database test failed:", error.message);
    console.log("\n💡 Setup instructions:");
    console.log("1. Make sure MySQL is installed and running");
    console.log("2. Create database: mysql -u root -p < database_setup.sql");
    console.log("3. Or run: mysql -u root -p -e 'CREATE DATABASE suraksha_yaatri;'");
    return;
  }
  
  console.log(stdout);
  
  console.log("\n2️⃣ Starting server...");
  exec('node server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(" Server failed to start:", error.message);
      return;
    }
    console.log(stdout);
  });
});

