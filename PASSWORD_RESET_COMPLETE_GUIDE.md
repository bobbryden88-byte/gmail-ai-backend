# 🔐 Password Reset Feature - Complete Implementation Guide

## ✅ **IMMEDIATE SUCCESS**

**Password reset completed for bob.bryden@brentwood.ca!**

**New Login Credentials:**
- Email: `bob.bryden@brentwood.ca`
- Password: `NewPassword123!`

You can now login to the extension with these credentials!

---

## 🎯 **What Was Implemented**

### **1. Database Schema** ✅
- Added `resetPasswordToken` field (stores secure token)
- Added `resetPasswordExpiry` field (token expires in 1 hour)
- Migration applied successfully

### **2. Backend API Endpoints** ✅

#### **POST /api/auth/forgot-password**
- Accepts email address
- Generates secure random token
- Saves token + expiry to database
- Sends reset email (or logs URL in dev mode)
- Always returns success (prevents email enumeration)
- Rate limited: 3 requests per hour per IP

#### **GET /api/auth/verify-reset-token**
- Checks if token is valid and not expired
- Returns user email if valid
- Used by reset page to show form or error

#### **POST /api/auth/reset-password**
- Accepts token + new password
- Validates token and expiry
- Hashes new password with bcrypt
- Updates password in database
- Clears reset token
- Sends confirmation email

### **3. Email Service** ✅
- Professional HTML email templates
- Password reset email with clickable link
- Password changed confirmation email
- Development mode (logs instead of sending)
- Production mode (uses Gmail SMTP)

### **4. Frontend UI** ✅
- "Forgot Password?" link on login page
- Forgot password form in extension popup
- Reset password web page at `/reset-password`
- Proper form validation
- Loading states and error messages
- Success confirmation

---

## 🧪 **How to Test (Development Mode)**

Since SMTP isn't configured yet, the system will log reset URLs to the console:

### **Test 1: Request Password Reset**

1. **Open extension popup**
2. **Click "Forgot Password?" link**
3. **Enter email**: `bob.bryden@brentwood.ca`
4. **Click "Send Reset Link"**
5. **Check backend console** - you'll see:
   ```
   📧 Sending reset email to: bob.bryden@brentwood.ca
   📝 Email would be sent (SMTP not configured):
   To: bob.bryden@brentwood.ca
   Reset URL: http://localhost:3000/reset-password?token=abc123...
   ```

### **Test 2: Reset Password**

1. **Copy the reset URL** from backend console
2. **Open URL in browser**
3. **Enter new password** (min 6 chars)
4. **Confirm password**
5. **Click "Reset Password"**
6. **Success!** Password is changed

### **Test 3: Login with New Password**

1. **Open extension popup**
2. **Login with** new password
3. **Success!**

---

## 📧 **Setting Up Email (Production)**

To actually send emails, add these to your `.env` file:

### **Option 1: Gmail (Recommended for Testing)**

1. **Go to Google Account Settings**
2. **Enable 2-Factor Authentication**
3. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Gmail AI Assistant"
   - Copy the 16-character password

4. **Add to `.env`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   FRONTEND_URL=http://localhost:3000
   ```

5. **Restart backend**:
   ```bash
   npm run dev
   ```

### **Option 2: SendGrid (Recommended for Production)**

1. **Sign up**: https://sendgrid.com/
2. **Create API Key**
3. **Add to `.env`**:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### **Option 3: Mailgun**

1. **Sign up**: https://mailgun.com/
2. **Get SMTP credentials**
3. **Add to `.env`**:
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-smtp-user
   SMTP_PASS=your-mailgun-smtp-password
   ```

---

## 🔒 **Security Features**

### **✅ Implemented:**
- Secure token generation (`crypto.randomBytes(32)`)
- 1-hour token expiration
- Tokens cleared after successful reset
- Password hashing with bcrypt (12 rounds)
- Rate limiting (3 requests/hour per IP)
- Email enumeration prevention (always same response)
- Minimum password length (6 characters)
- Token validation before showing reset form

### **🛡️ What Makes This Secure:**
1. **Tokens are cryptographically random** (not guessable)
2. **Tokens expire** (can't be used later)
3. **One-time use** (cleared after reset)
4. **Rate limited** (prevents brute force)
5. **No email enumeration** (attackers can't discover emails)
6. **HTTPS in production** (tokens encrypted in transit)

---

## 🎨 **User Experience Flow**

```
User forgets password
    ↓
Clicks "Forgot Password?" on login
    ↓
Enters email address
    ↓
Receives email with reset link
    ↓
Clicks link → Opens reset page
    ↓
Enters new password (twice)
    ↓
Password reset successful!
    ↓
Receives confirmation email
    ↓
Logs in with new password
```

---

## 📝 **API Testing**

### **Test Forgot Password Endpoint:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"bob.bryden@brentwood.ca"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account exists with that email, you will receive a password reset link."
}
```

### **Test Verify Token Endpoint:**
```bash
curl "http://localhost:3000/api/auth/verify-reset-token?token=YOUR_TOKEN_HERE"
```

**Expected Response (Valid):**
```json
{
  "valid": true,
  "message": "Token is valid",
  "email": "bob.bryden@brentwood.ca"
}
```

### **Test Reset Password Endpoint:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE","newPassword":"NewPassword456!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

## 🐛 **Troubleshooting**

### **Problem: Reset link doesn't work**
- **Check**: Token hasn't expired (1 hour limit)
- **Check**: Backend is running
- **Check**: Token is correct (full string from email)

### **Problem: Email not received**
- **In dev mode**: Check backend console for reset URL
- **In production**: 
  - Check SMTP credentials in `.env`
  - Check spam folder
  - Verify email service is working

### **Problem: "Token invalid or expired"**
- Token expires after 1 hour
- Request new reset email
- Each token can only be used once

### **Problem: Rate limit error**
- Wait 1 hour
- Only 3 requests per hour per IP
- This prevents abuse

---

## 📊 **Database Changes**

Check user's reset token in database:

```bash
npx prisma studio
```

Or via script:

```javascript
const user = await prisma.user.findUnique({
  where: { email: 'bob.bryden@brentwood.ca' },
  select: {
    resetPasswordToken: true,
    resetPasswordExpiry: true
  }
});
console.log(user);
```

---

## 🚀 **Production Deployment**

### **Before Going Live:**

1. ✅ Set up email service (Gmail/SendGrid/Mailgun)
2. ✅ Add SMTP credentials to production `.env`
3. ✅ Update `FRONTEND_URL` in `.env` to production URL
4. ✅ Test complete flow end-to-end
5. ✅ Verify emails are being sent
6. ✅ Test rate limiting works
7. ✅ Ensure HTTPS is enabled

### **Environment Variables for Production:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
FRONTEND_URL=https://your-production-domain.com
```

---

## 🎉 **Feature Complete!**

You now have a fully functional password reset system with:

- ✅ **Manual reset script** for emergencies
- ✅ **Self-service password reset** for users
- ✅ **Secure token generation** and validation
- ✅ **Professional email templates**
- ✅ **Rate limiting** for security
- ✅ **Beautiful UI** in extension and web page
- ✅ **Comprehensive error handling**
- ✅ **Development and production modes**

---

## 📚 **Files Created/Modified:**

### **Backend:**
- `prisma/schema.prisma` - Added reset fields
- `src/services/email.js` - Email service (NEW)
- `src/routes/password-reset.js` - Password reset routes (NEW)
- `src/app.js` - Mounted password reset routes
- `public/reset-password.html` - Reset password page (NEW)
- `reset-password-manual.js` - Manual reset script (NEW)

### **Frontend:**
- `popup/auth.html` - Added forgot password form + link
- `popup/auth.css` - Styled forgot password link
- `popup/auth.js` - Added forgot password handlers

---

**Your users will never be locked out again!** 🎉
