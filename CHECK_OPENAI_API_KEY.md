# 🔑 Check OpenAI API Key in Vercel

## Problem

You're getting:
```
Backend Error: Backend API error: 500 - {"error":"Failed to generate response"}
```

This usually means the **OpenAI API key is missing or invalid** in Vercel.

## Solution: Verify OPENAI_API_KEY in Vercel

### Step 1: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click: **gmail-ai-backend** project
3. Go to: **Settings** → **Environment Variables**
4. Look for: **`OPENAI_API_KEY`**
5. Check:
   - ✅ Does it exist?
   - ✅ Does it start with `sk-`?
   - ✅ Is it set for **Production, Preview, and Development**?

### Step 2: If Missing or Invalid

1. **Get your OpenAI API key:**
   - Go to: https://platform.openai.com/api-keys
   - Create a new key or copy an existing one
   - Should start with `sk-proj-` or `sk-`

2. **Add to Vercel:**
   - Go to: **Settings** → **Environment Variables**
   - Click: **Add New**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (your full API key)
   - Select: **Production, Preview, Development**
   - Click: **Save**

3. **Redeploy:**
   - Go to: **Deployments**
   - Click: **Latest deployment** → **Redeploy**
   - Wait 2-3 minutes

### Step 3: Test Again

After redeploy, try generating an email response again. It should work!

## Common Issues

### Issue 1: API Key Not Set
- **Symptom:** `Failed to generate response`
- **Fix:** Add `OPENAI_API_KEY` to Vercel

### Issue 2: Invalid API Key
- **Symptom:** `Failed to generate response` with OpenAI error
- **Fix:** Generate a new key from OpenAI dashboard

### Issue 3: API Key Expired/Revoked
- **Symptom:** `Failed to generate response`
- **Fix:** Create a new key and update in Vercel

### Issue 4: Rate Limit Exceeded
- **Symptom:** OpenAI rate limit error
- **Fix:** Wait a few minutes or upgrade OpenAI plan

## Check Vercel Logs

After adding the key and redeploying, check logs:

1. Go to: **Deployments** → **Latest**
2. Click: **Function Logs**
3. Try generating a response
4. Look for:
   - ✅ `OpenAI API Error:` - Shows the actual error
   - ✅ `hasApiKey: true` - Confirms key is set
   - ❌ `hasApiKey: false` - Key is missing

---

**Most likely issue: `OPENAI_API_KEY` is not set in Vercel environment variables!** 🔑
