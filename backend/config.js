// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Yashu04@pass',
  database: process.env.DB_NAME || 'suraksha_yaatri'
};

// Server configuration
const serverConfig = {
  port: process.env.PORT || 5000
};

// CORS configuration
const corsConfig = {
  origins: [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080", 
    "http://127.0.0.1:8081",
    "http://192.168.1.88:8080",
    "http://192.168.1.88:8081"
  ]
};

module.exports = {
  dbConfig,
  serverConfig,
  corsConfig
};

