# 🔍 Debug Login Issues - Step by Step Guide

## Current Problem
Both email/password login and Google sign-in are failing despite correct credentials.

## 🔍 Diagnostic Steps

### Step 1: Check Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required variables:**
- [ ] `JWT_SECRET` - Should be set (you already have this ✅)
- [ ] `DATABASE_URL` - Should be set (you have this ✅)
- [ ] `OPENAI_API_KEY` - Should be set (you have this ✅)
- [ ] `GOOGLE_CLIENT_ID` - **CHECK IF THIS IS SET!**
  - Value should be: `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`
  - Or: `999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com`

### Step 2: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "View Function Logs"
4. Try to sign in again
5. Look for errors in the logs

**Common errors to look for:**
- `GOOGLE_CLIENT_ID not configured` → Add GOOGLE_CLIENT_ID to Vercel
- `Database connection error` → Check DATABASE_URL format
- `Prisma Client` errors → Database might not be accessible
- `JWT_SECRET` errors → Already fixed ✅

### Step 3: Test Backend Endpoints Directly

#### Test Health Endpoint:
```bash
curl https://gmail-ai-backend.vercel.app/health
```
Should return: `{"status":"OK",...}` ✅ (This works)

#### Test Google OAuth Endpoint:
```bash
curl -X POST https://gmail-ai-backend.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","googleId":"test123","name":"Test"}'
```

**Expected responses:**
- `200 OK` with token → Endpoint works
- `400 Bad Request` → Missing fields (check request format)
- `500 Internal Server Error` → Database or config issue

#### Test Login Endpoint:
```bash
curl -X POST https://gmail-ai-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob.bryden88@gmail.com","password":"yourpassword"}'
```

### Step 4: Check Database Connection

The `DATABASE_URL` you have starts with `napi_` which is unusual. It should be:
```
postgresql://user:password@host:port/database
```

**If DATABASE_URL is wrong:**
1. Go to your database provider (Neon/Supabase/Railway)
2. Get the connection string
3. Update in Vercel → Environment Variables
4. Redeploy

### Step 5: Check Extension Console

1. Open extension popup
2. Right-click → Inspect
3. Go to Console tab
4. Try to sign in
5. Look for error messages

**Common extension errors:**
- `Failed to fetch` → Backend not reachable (but health check works, so unlikely)
- `Failed to authenticate with Google` → Backend error (check Vercel logs)
- `Network error` → CORS or connection issue

## 🎯 Most Likely Issues

### Issue 1: GOOGLE_CLIENT_ID Missing
**Symptom:** Google sign-in fails with "Failed to authenticate with Google"

**Fix:**
1. Go to Vercel → Environment Variables
2. Add `GOOGLE_CLIENT_ID`
3. Value: `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`
4. Redeploy

### Issue 2: Database Connection Issue
**Symptom:** Both login methods fail, backend returns 500 errors

**Fix:**
1. Check DATABASE_URL format in Vercel
2. Verify database is accessible
3. Check Vercel logs for Prisma errors

### Issue 3: User Doesn't Exist in Production Database
**Symptom:** Login fails with "Invalid email or password"

**Fix:**
1. Create account again (register or Google sign-in)
2. This will create user in production database

## ✅ Quick Fix Checklist

- [ ] Add `GOOGLE_CLIENT_ID` to Vercel (if missing)
- [ ] Verify `DATABASE_URL` format is correct
- [ ] Check Vercel function logs for specific errors
- [ ] Try creating a new account (might not exist in production DB)
- [ ] Redeploy after adding environment variables

## 📝 After Fixes

1. **Redeploy on Vercel**
2. **Try Google sign-in again**
3. **Check Vercel logs** for any remaining errors
4. **Share the specific error message** from Vercel logs if it still fails

---

**The improved error handling will now show specific error messages in Vercel logs, making it easier to identify the exact issue.**
