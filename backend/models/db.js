const mysql = require("mysql2");
const { dbConfig } = require("../config");

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error(" DB connection error:", err);
    console.log(" Make sure MySQL is running and database 'suraksha_yaatri' exists");
    console.log(" Run: mysql -u root -p < database_setup.sql");
  } else {
    console.log(" Connected to MySQL database:", dbConfig.database);
  }
});

module.exports = db;

