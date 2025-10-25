# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the `Basic Backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cardiac-arrest

# JWT Secrets (generate strong random strings)
ACCESS_TOKEN_SECRET=your-access-token-secret-key-here-make-it-long-and-random
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-here-make-it-long-and-random

# JWT Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=8000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:8080

# Cloudinary (optional - for avatar uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Installation and Running

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on your system

3. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:8000

## API Endpoints

- POST `/api/v1/users/register` - User registration
- POST `/api/v1/users/login` - User login
- POST `/api/v1/users/logout` - User logout
- GET `/api/v1/users/current-user` - Get current user
- POST `/api/v1/users/refresh-token` - Refresh access token
- PATCH `/api/v1/users/update-account` - Update user profile
- POST `/api/v1/users/change-password` - Change password

## Frontend Configuration

The frontend is configured to connect to `http://localhost:8000/api/v1` by default. You can change this by setting the `VITE_API_BASE_URL` environment variable in the frontend.
