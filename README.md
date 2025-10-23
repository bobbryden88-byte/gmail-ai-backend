# Gmail AI Assistant Backend

A complete backend API for the Gmail AI Assistant Chrome Extension, providing secure AI-powered email response generation with user authentication, usage tracking, and subscription management.

## 🏗️ Architecture

```
Chrome Extension → Backend API → OpenAI API
                ↓
           Database (user data, usage tracking)
```

## 🚀 Features

- **Secure API**: JWT-based authentication
- **Usage Tracking**: Daily/monthly limits for free and premium users
- **Rate Limiting**: Multiple layers of protection against abuse
- **OpenAI Integration**: GPT-4 powered email response generation
- **Stripe Integration**: Subscription management
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet.js, CORS, input validation

## 📁 Project Structure

```
gmail-ai-backend/
├── src/
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── ai.js            # AI generation endpoints
│   │   └── users.js         # User management endpoints
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── rateLimit.js     # Rate limiting middleware
│   ├── services/
│   │   ├── openai.js        # OpenAI API integration
│   │   └── stripe.js        # Stripe payment integration
│   └── app.js               # Main Express application
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.example             # Environment variables template
└── package.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gmail_ai_db"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key-here"

# Server
PORT=3000
NODE_ENV=development

# URLs
UPGRADE_URL="https://your-stripe-checkout-url.com"
```

### 3. Database Setup

#### Option 1: PostgreSQL (Recommended)

```bash
# Install PostgreSQL locally or use a cloud service
# Create database
createdb gmail_ai_db

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

#### Option 2: SQLite (Development)

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Google OAuth (for Chrome Extension)
```http
POST /api/auth/google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "name": "John Doe",
  "googleId": "google-user-id"
}
```

### AI Generation

#### Generate Email Response
```http
POST /api/ai/generate
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "emailContent": {
    "subject": "Meeting Request",
    "sender": "colleague@company.com",
    "body": "Hi, would you like to meet tomorrow at 2 PM?"
  },
  "style": "brief"
}
```

#### Get Usage Statistics
```http
GET /api/ai/usage
Authorization: Bearer <jwt-token>
```

### User Management

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Upgrade to Premium
```http
POST /api/users/upgrade
Authorization: Bearer <jwt-token>
```

## 🔧 Usage Limits

### Free Users
- 10 AI generations per day
- 300 generations per month

### Premium Users
- 100 AI generations per day
- 3000 generations per month

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Multiple layers of protection
- **Input Validation**: Sanitized user inputs
- **CORS Protection**: Configured for Chrome extension
- **Helmet.js**: Security headers
- **Environment Variables**: Sensitive data protection

## 🚀 Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway deploy
```

### Vercel (Serverless)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔗 Chrome Extension Integration

Update your Chrome extension to use the backend:

```javascript
class AIService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-api-domain.com' 
      : 'http://localhost:3000';
  }

  async generateResponse(emailContent, style = 'brief') {
    const { userToken } = await chrome.storage.sync.get(['userToken']);
    
    const response = await fetch(`${this.baseURL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ emailContent, style })
    });

    return response.json();
  }
}
```

## 📊 Monitoring & Analytics

- **Health Check**: `GET /health`
- **Usage Tracking**: Built-in user usage monitoring
- **Error Logging**: Comprehensive error handling
- **Rate Limit Headers**: Built-in rate limit information

## 🧪 Testing

```bash
# Test API endpoints
curl -X GET http://localhost:3000/health

# Test AI generation (with valid token)
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailContent": {
      "subject": "Test",
      "sender": "test@example.com",
      "body": "This is a test email"
    }
  }'
```

## 🔄 Development Workflow

1. **Local Development**: `npm run dev`
2. **Database Changes**: Update `prisma/schema.prisma` and run `npx prisma migrate dev`
3. **Testing**: Use Postman or curl to test endpoints
4. **Deployment**: Push to your deployment platform

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `UPGRADE_URL` | Stripe checkout URL | No |

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Run `npx prisma migrate dev`

2. **OpenAI API Error**
   - Verify `OPENAI_API_KEY` is correct
   - Check API key permissions and billing

3. **JWT Token Error**
   - Ensure `JWT_SECRET` is set
   - Check token expiration

4. **CORS Error**
   - Update CORS configuration in `app.js`
   - Add your extension ID to allowed origins

## 📈 Next Steps

1. **Add Webhooks**: Stripe webhook handling
2. **Analytics**: User behavior tracking
3. **Caching**: Redis for improved performance
4. **Monitoring**: Application monitoring setup
5. **Testing**: Automated test suite

## 📄 License

ISC License - see LICENSE file for details.
