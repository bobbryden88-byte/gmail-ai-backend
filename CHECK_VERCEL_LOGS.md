# 🔍 How to Check Vercel Function Logs

## Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in
3. Click on your **gmail-ai-backend** project

### Step 2: Open Deployments
1. Click the **Deployments** tab (top navigation)
2. You'll see a list of all deployments
3. Find the **latest deployment** (should be at the top)

### Step 3: View Function Logs
1. Click on the **latest deployment** (the one with the green checkmark or "Ready" status)
2. This opens the deployment details page
3. Look for **"Function Logs"** or **"Logs"** tab/button
4. Click it

**Alternative:**
- Some Vercel dashboards show logs directly on the deployment page
- Look for a **"Logs"** section or **"View Logs"** button

### Step 4: Trigger an Action to Generate Logs
1. **Keep the logs page open**
2. **Try to sign in** through your extension
3. **Watch the logs in real-time** - new entries will appear

### Step 5: Look for Errors
In the logs, look for:

**Good signs (✅):**
- `Google OAuth request received`
- `Searching for user with email: ...`
- `User lookup result: Found user ...` or `User not found`
- `Creating new user for: ...`
- `✅ New user registered via Google: ...`
- `JWT token generated successfully`

**Bad signs (❌):**
- `GOOGLE_CLIENT_ID not configured`
- `Database connection error`
- `Prisma Client` errors
- `JWT_SECRET is not set`
- `Error creating user`
- `Failed to authenticate with Google`

## 📋 What to Share

After trying to sign in, copy and share:
1. **Any error messages** from the logs
2. **The last 10-20 lines** of logs after your sign-in attempt
3. **Any red/error entries**

## 🎯 Common Log Patterns

### Pattern 1: Missing GOOGLE_CLIENT_ID
```
GOOGLE_CLIENT_ID is not set in environment variables
Error: GOOGLE_CLIENT_ID not configured
```
**Fix:** Add GOOGLE_CLIENT_ID to Vercel

### Pattern 2: Database Connection Error
```
PrismaClientInitializationError
Can't reach database server
```
**Fix:** Check DATABASE_URL format

### Pattern 3: User Creation Error
```
Error creating user: ...
Unique constraint failed
```
**Fix:** User might already exist, or database schema issue

### Pattern 4: JWT Error
```
JWT_SECRET is not set
```
**Fix:** Already fixed ✅ (you have JWT_SECRET set)

---

**The logs will tell us exactly what's failing!**
