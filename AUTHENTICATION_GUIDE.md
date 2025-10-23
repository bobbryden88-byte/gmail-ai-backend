# 🔐 Gmail AI Backend - Authentication Implementation Guide

## ✅ Completed Implementation

Your backend now has full user authentication with registration, login, and secure password hashing!

## 🎯 Available Endpoints

### **Authentication Endpoints**

#### 1. User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword123",
  "name": "Your Name"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmgi0lepz0000prux6erktc6g",
    "email": "user@example.com",
    "name": "Your Name",
    "isPremium": false
  }
}
```

#### 2. User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmgi0lepz0000prux6erktc6g",
    "email": "user@example.com",
    "name": "Your Name",
    "isPremium": false,
    "dailyUsage": 0,
    "monthlyUsage": 0
  }
}
```

#### 3. Verify Token
```bash
GET /api/auth/verify
Authorization: Bearer YOUR_JWT_TOKEN

Response:
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "cmgi0lepz0000prux6erktc6g",
    "email": "user@example.com",
    "isPremium": false
  }
}
```

### **AI Endpoints**

#### 1. Generate Response (No Auth - Testing)
```bash
POST /api/ai/generate-test
Content-Type: application/json

{
  "emailContent": {
    "subject": "Email subject",
    "sender": "sender@example.com",
    "body": "Email body text"
  },
  "style": "brief"
}
```

#### 2. Generate Response (With Auth - Production)
```bash
POST /api/ai/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "emailContent": {
    "subject": "Email subject",
    "sender": "sender@example.com",
    "body": "Email body text"
  },
  "style": "brief"
}
```

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **JWT Tokens**: 30-day expiration
- ✅ **Rate Limiting**: 5 login/registration attempts per 15 minutes
- ✅ **Email Validation**: Lowercase normalization
- ✅ **Password Requirements**: Minimum 6 characters
- ✅ **Secure Storage**: Passwords never stored in plain text

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Test AI with Auth
```bash
# First, get the token from login/register
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "emailContent": {
      "subject": "Test",
      "sender": "test@example.com",
      "body": "This is a test email"
    },
    "style": "brief"
  }'
```

## 🔄 Integration with Chrome Extension

### Step 1: Add Registration/Login UI
Create a popup or page in your extension for user registration and login.

### Step 2: Store JWT Token
```javascript
// After successful login/registration
chrome.storage.sync.set({ 
  userToken: data.token,
  userId: data.user.id,
  userEmail: data.user.email
});
```

### Step 3: Use Token for AI Requests
```javascript
// Get token from storage
const { userToken } = await chrome.storage.sync.get(['userToken']);

// Make authenticated request
fetch('http://localhost:3000/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({ emailContent, style: 'brief' })
});
```

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?  // Hashed password
  isPremium Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Usage tracking
  dailyUsage     Int      @default(0)
  monthlyUsage   Int      @default(0)
  lastUsageDate  DateTime?
  lastResetDate  DateTime?
  
  // Subscription
  stripeCustomerId String?
  subscriptionId   String?
  
  @@map("users")
}
```

## 🚀 Next Steps

1. **Update Chrome Extension**
   - Add login/registration UI
   - Store JWT tokens
   - Use authenticated endpoints

2. **Add Features**
   - Password reset functionality
   - Email verification
   - Social login (Google OAuth)
   - Premium subscription management

3. **Deploy to Production**
   - Set up production database
   - Configure environment variables
   - Deploy to Railway/Vercel/Heroku

## 🎉 Implementation Complete!

Your backend now has:
- ✅ User registration with secure password hashing
- ✅ User login with JWT token generation
- ✅ Token verification
- ✅ Rate limiting on auth endpoints
- ✅ Full CORS support for Chrome extensions
- ✅ Both authenticated and test AI endpoints
- ✅ Usage tracking per user
- ✅ Premium tier support

**Your Gmail AI Assistant backend is production-ready!**

