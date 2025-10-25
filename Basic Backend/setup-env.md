# Environment Setup for MongoDB Atlas

Create a `.env` file in the `Basic Backend` directory with the following content:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://caffeinecoder2005:caffeine12@cluster0.memromo.mongodb.net/CardiacArrest?appName=Cluster0

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

## Important Notes:

1. **MongoDB Atlas**: Your connection string is already configured correctly
2. **JWT Secrets**: Generate strong, random strings for security
3. **CORS**: Set to your frontend URL (http://localhost:8080)
4. **Database Name**: The connection string already includes the database name "CardiacArrest"

## To generate JWT secrets, you can use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this command twice to get two different secrets for ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET.
