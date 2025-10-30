const mysql = require("mysql2");
const { dbConfig } = require("./config");

// Test database connection and create database if it doesn't exist
async function testDatabase() {
  console.log("🔍 Testing database connection...");
  
  // First, connect without specifying database
  const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    // Create database if it doesn't exist
    await connection.promise().query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' is ready`);
    
    // Now connect to the specific database
    const db = mysql.createConnection(dbConfig);
    
    // Test the connection
    await db.promise().query("SELECT 1");
    console.log("✅ Database connection successful");
    
    // Check if tables exist
    const [tables] = await db.promise().query("SHOW TABLES");
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    if (tables.length === 0) {
      console.log("⚠️  No tables found. Please run: mysql -u root -p < database_setup.sql");
    }
    
    db.end();
    connection.end();
    
  } catch (error) {
    console.error("❌ Database error:", error.message);
    console.log("💡 Make sure MySQL is running and credentials are correct");
    connection.end();
    process.exit(1);
  }
}

testDatabase();

