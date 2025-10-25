# Complete Authentication Integration Guide

## 🚀 Quick Start

### 1. Backend Setup
```bash
# Navigate to backend directory
cd "D:\Mini Project\Cardiac-Arrest\Basic Backend"

# Install dependencies (if not already done)
npm install

# Create .env file with your MongoDB Atlas connection
# Copy the content from setup-env.md

# Start backend server
npm run dev
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd "D:\Mini Project\Cardiac-Arrest\frontend"

# Install dependencies (if not already done)
npm install

# Start frontend server
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env file in Basic Backend directory)
```env
MONGO_URI=mongodb+srv://caffeinecoder2005:caffeine12@cluster0.memromo.mongodb.net/CardiacArrest?appName=Cluster0
ACCESS_TOKEN_SECRET=your-access-token-secret-key-here-make-it-long-and-random
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-here-make-it-long-and-random
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

### Frontend (no .env needed - uses default API URL)
- Default API URL: `http://localhost:8000/api/v1`
- Can be overridden with `VITE_API_BASE_URL` environment variable

## 🧪 Testing the Integration

### 1. Test Registration
1. Go to `http://localhost:8080/login/user` or `http://localhost:8080/login/doctor`
2. Click "Don't have an account? Sign up"
3. Fill in the registration form:
   - Full Name: Required
   - Username: Required (must be unique)
   - Email: Required (must be unique)
   - Password: Required
   - Age: Optional
   - Gender: Optional
   - Phone: Optional
4. Click "Sign Up"
5. Should see success message and redirect to login

### 2. Test Login
1. Use the credentials from registration
2. Can login with either email or username
3. Should redirect to appropriate dashboard based on role

### 3. Test Protected Routes
1. Try accessing `/dashboard` without login - should redirect to login
2. Try accessing `/user-dashboard` without login - should redirect to login
3. Login and verify access to correct dashboard

## 🔍 Troubleshooting

### Common Issues:

1. **Backend not starting**:
   - Check if MongoDB Atlas connection is correct
   - Verify .env file exists and has correct values
   - Check if port 8000 is available

2. **Frontend not connecting to backend**:
   - Verify backend is running on port 8000
   - Check browser console for CORS errors
   - Verify API_BASE_URL is correct

3. **Registration fails**:
   - Check backend logs for errors
   - Verify all required fields are provided
   - Check if username/email already exists

4. **Login fails**:
   - Verify credentials are correct
   - Check if user exists in database
   - Verify JWT secrets are set

### Debug Steps:
1. Check browser console for errors
2. Check backend terminal for errors
3. Test API endpoints directly with Postman
4. Verify database connection

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | User registration |
| POST | `/api/v1/users/login` | User login |
| POST | `/api/v1/users/logout` | User logout |
| GET | `/api/v1/users/current-user` | Get current user |
| POST | `/api/v1/users/refresh-token` | Refresh access token |

## 🎯 User Roles

- **Doctor**: Access to `/dashboard` with full features
- **User**: Access to `/user-dashboard` with limited features

## 🔐 Security Features

- JWT access and refresh tokens
- Password hashing with bcrypt
- CORS protection
- Role-based authorization
- Input validation
- Secure cookie handling
