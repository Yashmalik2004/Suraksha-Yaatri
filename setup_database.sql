-- Database setup script for Suraksha Yaatri
-- Run this script to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS suraksha_yaatri;
USE suraksha_yaatri;

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('active', 'acknowledged', 'resolved', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resolved_alerts table
CREATE TABLE IF NOT EXISTS resolved_alerts (
    id INT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    priority ENUM('low', 'medium', 'high', 'critical'),
    created_at TIMESTAMP,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create history_alerts table
CREATE TABLE IF NOT EXISTS history_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    priority ENUM('low', 'medium', 'high', 'critical'),
    status ENUM('resolved', 'expired') DEFAULT 'resolved',
    created_at TIMESTAMP,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create published_alerts table
CREATE TABLE IF NOT EXISTS published_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    priority ENUM('low', 'medium', 'high', 'critical'),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expired_alerts table
CREATE TABLE IF NOT EXISTS expired_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    priority ENUM('low', 'medium', 'high', 'critical'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    blockchain_id VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20),
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_contacts table
CREATE TABLE IF NOT EXISTS user_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    relation VARCHAR(50),
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT IGNORE INTO users (id, username, email, password_hash, blockchain_id, phone_number) VALUES 
(1, 'testuser', 'test@example.com', '$2b$10$example_hash', 'blockchain123', '+1234567890');

INSERT IGNORE INTO user_contacts (user_id, contact_name, relation, phone_number) VALUES 
(1, 'Emergency Contact', 'Family', '+1234567891'),
(1, 'Police', 'Emergency', '100'),
(1, 'Ambulance', 'Emergency', '108');

-- Create indexes for better performance
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_users_blockchain_id ON users(blockchain_id);
CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);

