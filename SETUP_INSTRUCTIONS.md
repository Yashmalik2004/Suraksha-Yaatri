# Suraksha Yaatri - Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **MySQL** (v8.0 or higher)
4. **Git**

## Environment Setup

### 1. Frontend Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Frontend Environment Variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_BASE=http://localhost:5000
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Development settings
VITE_NODE_ENV=development
```

**To get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the key to your domain for security

### 2. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Backend Environment Variables
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
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5173
```

## Database Setup

### 1. Install MySQL
- Download and install MySQL from [mysql.com](https://www.mysql.com/downloads/)
- Start MySQL service

### 2. Create Database
Run the following command in MySQL:

```bash
mysql -u root -p < setup_database.sql
```

Or manually execute the SQL commands in `setup_database.sql`

## Installation

### 1. Frontend Dependencies
```bash
npm install
```

### 2. Backend Dependencies
```bash
cd backend
npm install
```

### 3. AI Dependencies
```bash
cd ai
pip install -r requirements.txt
```

## Running the Application

### 1. Start MySQL
Make sure MySQL is running on your system.

### 2. Start Backend Server
```bash
cd backend
npm start
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

### 4. Start AI Detection (Optional)
```bash
cd ai
python app.py
```

## Verification

1. **Frontend**: Visit `http://localhost:8080`
2. **Backend**: Visit `http://localhost:5000` (should show "Backend running")
3. **Database**: Check MySQL for `suraksha_yaatri` database

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in backend/.env
   - Verify database exists: `suraksha_yaatri`

2. **Google Maps Not Loading**
   - Check VITE_GOOGLE_MAPS_API_KEY in .env
   - Ensure API key has Maps JavaScript API enabled
   - Check browser console for errors

3. **AI Detection Not Working**
   - Install Python dependencies: `pip install -r ai/requirements.txt`
   - Ensure camera is available
   - Check if `best.pt` model file exists in ai/ directory

4. **CORS Errors**
   - Check CORS_ORIGINS in backend/.env
   - Ensure frontend URL is included in allowed origins

### Port Conflicts

If ports are in use:
- Frontend: Change port in `vite.config.ts`
- Backend: Change PORT in backend/.env
- Update CORS_ORIGINS accordingly

## Security Notes

1. **Never commit .env files** to version control
2. **Use strong passwords** for database and JWT secret
3. **Restrict API keys** to specific domains/IPs
4. **Use HTTPS** in production

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production database credentials
3. Configure proper CORS origins
4. Use environment-specific API keys
5. Enable SSL/TLS certificates

