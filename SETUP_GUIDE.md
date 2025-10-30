# 🚨 Suraksha Yaatri - Setup Guide

## Issues Found & Fixed

### 1. **CORS Configuration** ✅ FIXED
- **Problem**: CORS was only allowing `http://192.168.1.88:8080` but frontend runs on `http://localhost:8081`
- **Solution**: Updated CORS to support multiple localhost ports (3000, 5173, 8080, 8081)

### 2. **Missing Environment Configuration** ✅ FIXED
- **Problem**: No `.env` file and hardcoded database config
- **Solution**: Created `config.js` with proper database and server configuration

### 3. **Database Setup** ✅ FIXED
- **Problem**: No database schema or setup instructions
- **Solution**: Created `database_setup.sql` with all required tables

### 4. **Geolocation Security** ✅ FIXED
- **Problem**: Browser blocks geolocation on non-HTTPS/non-localhost
- **Solution**: Added fallback to use default coordinates when geolocation fails

## 🚀 Quick Setup Instructions

### Step 1: Database Setup
```bash
# Make sure MySQL is running
# Create database and tables
mysql -u root -p < backend/database_setup.sql
```

### Step 2: Start Backend
```bash
cd backend
node start.js
```

### Step 3: Start Frontend
```bash
npm run dev
```

### Step 4: Test SOS Flow
1. Open `http://localhost:8081` (or whatever port Vite shows)
2. Navigate to UserSOS page
3. Click Emergency SOS button
4. Open AdminDashboard in another tab
5. Verify alert appears in real-time

## 🔧 Manual Setup (if needed)

### Backend Setup
```bash
cd backend
npm install
node test_db.js  # Test database connection
node server.js   # Start server
```

### Frontend Setup
```bash
npm install
npm run dev
```

## 🐛 Troubleshooting

### Port 5000 Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process (replace PID)
taskkill /PID <PID_NUMBER> /F
```

### Database Connection Error
1. Make sure MySQL is running
2. Check credentials in `backend/config.js`
3. Create database: `mysql -u root -p -e 'CREATE DATABASE suraksha_yaatri;'`

### Geolocation Error
- Use `http://localhost:8081` (not network IP)
- Or the app will use default coordinates (Delhi)

### CORS Error
- Make sure frontend URL is in `backend/config.js` corsConfig.origins
- Restart backend after changing CORS config

## 📋 Database Tables Created
- `alerts` - Active SOS alerts
- `resolved_alerts` - Resolved alerts
- `history_alerts` - Alert history
- `published_alerts` - Published alerts
- `expired_alerts` - Expired alerts
- `users` - User accounts
- `user_contacts` - Emergency contacts
- `admins` - Admin accounts

## 🔄 SOS Alert Flow
1. User clicks SOS button → `UserSOS.tsx`
2. Gets location (or uses default) → `handleSOSPress()`
3. Sends POST to `/alerts/sos/:userId` → `alertController.sendSOS()`
4. Creates alert in database → `alerts` table
5. Emits socket event → `io.emit("new-alert")`
6. AdminDashboard receives event → `socket.on("new-alert")`
7. Updates UI in real-time → `setActiveAlerts()`

## ✅ All Issues Resolved!
The SOS emergency button should now work properly and send alerts to the admin dashboard in real-time.

