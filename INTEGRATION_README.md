# Authentication Integration - Frontend & Backend

This document describes the complete authentication integration between the React frontend and Node.js backend.

## 🚀 Features Implemented

### Backend (Node.js + Express + MongoDB)
- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ JWT access and refresh tokens
- ✅ Protected routes with middleware
- ✅ User profile management
- ✅ CORS configuration for frontend
- ✅ Cookie-based authentication

### Frontend (React + TypeScript)
- ✅ Login/Register forms with validation
- ✅ API service for backend communication
- ✅ Protected routes based on user roles
- ✅ Token management and storage
- ✅ Automatic logout on token expiry
- ✅ Role-based navigation (Doctor/User)

## 📁 File Structure

### Backend Files
```
Basic Backend/
├── src/
│   ├── controllers/user.controller.js    # Authentication logic
│   ├── models/user.model.js              # User schema
│   ├── routes/user.routes.js             # API routes
│   ├── middlewares/auth.middleware.js    # JWT verification
│   └── app.js                           # Express app configuration
└── setup.md                             # Setup instructions
```

### Frontend Files
```
frontend/src/
├── lib/
│   ├── api.ts                          # API service
│   └── auth.ts                         # Authentication utilities
├── components/
│   └── ProtectedRoute.tsx              # Route protection
├── pages/
│   └── Login.tsx                       # Login/Register page
└── App.tsx                             # Route configuration
```

## 🔧 Setup Instructions

### 1. Backend Setup
```bash
cd "Basic Backend"
npm install
```

Create `.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/cardiac-arrest
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
PORT=8000
CORS_ORIGIN=http://localhost:8080
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev
```

## 🔐 Authentication Flow

### Registration
1. User fills registration form
2. Frontend sends POST to `/api/v1/users/register`
3. Backend validates data and creates user
4. User is redirected to login

### Login
1. User enters credentials
2. Frontend sends POST to `/api/v1/users/login`
3. Backend validates credentials
4. JWT tokens are returned and stored
5. User is redirected to appropriate dashboard

### Protected Routes
1. `ProtectedRoute` component checks authentication
2. Redirects to login if not authenticated
3. Checks user role for role-specific routes

### Logout
1. Frontend calls `/api/v1/users/logout`
2. Tokens are cleared from storage
3. User is redirected to home page

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Access (15m) and Refresh (7d) tokens
- **CORS Protection**: Configured for frontend origin
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access**: Doctor vs User permissions
- **Secure Cookies**: HttpOnly, Secure cookies for tokens

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/users/register` | User registration | No |
| POST | `/api/v1/users/login` | User login | No |
| POST | `/api/v1/users/logout` | User logout | Yes |
| GET | `/api/v1/users/current-user` | Get current user | Yes |
| POST | `/api/v1/users/refresh-token` | Refresh access token | No |
| PATCH | `/api/v1/users/update-account` | Update profile | Yes |
| POST | `/api/v1/users/change-password` | Change password | Yes |

## 🎯 User Roles

### Doctor Role
- Access to doctor dashboard
- Patient management features
- Analytics and reporting
- Upload and analysis tools

### User Role
- Access to user dashboard
- Personal health tracking
- Basic analytics
- Limited upload capabilities

## 🔄 Token Management

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Automatic Refresh**: Frontend handles token refresh
- **Secure Storage**: Tokens stored in localStorage with fallback

## 🚨 Error Handling

- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: User-friendly error messages
- **Authentication Errors**: Automatic redirect to login
- **Token Expiry**: Automatic refresh or logout

## 🧪 Testing the Integration

1. **Start both servers**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:8080`

2. **Test Registration**:
   - Go to `/login/user` or `/login/doctor`
   - Click "Don't have an account? Sign up"
   - Fill registration form
   - Verify account creation

3. **Test Login**:
   - Use registered credentials
   - Verify dashboard access
   - Check role-based navigation

4. **Test Protected Routes**:
   - Try accessing `/dashboard` without login
   - Verify redirect to login page
   - Test role-based access

5. **Test Logout**:
   - Click logout button
   - Verify redirect to home page
   - Verify tokens are cleared

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
MONGODB_URI=mongodb://localhost:27017/cardiac-arrest
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
PORT=8000
CORS_ORIGIN=http://localhost:8080
```

**Frontend**: 
- Default API URL: `http://localhost:8000/api/v1`
- Can be overridden with `VITE_API_BASE_URL`

## 📝 Notes

- MongoDB must be running for the backend to work
- JWT secrets should be strong and unique
- CORS is configured for development (localhost:8080)
- All API calls include credentials for cookie support
- Frontend handles token refresh automatically
- Protected routes check both authentication and authorization

## 🐛 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS_ORIGIN in backend .env
2. **Database Connection**: Ensure MongoDB is running
3. **Token Issues**: Check JWT secrets in .env
4. **Frontend API Errors**: Verify API_BASE_URL configuration

### Debug Steps:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify environment variables
4. Test API endpoints directly with Postman/curl
