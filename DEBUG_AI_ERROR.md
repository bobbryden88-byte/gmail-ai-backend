# 🔍 Debug AI Generation Error

## Current Issue

After deploying, you're still getting:
```
Backend API error: 500 - {"error":"Failed to generate response"}
```

## Step 1: Check Vercel Function Logs (CRITICAL)

The logs will show the **exact OpenAI API error**. This is the most important step!

1. Go to: https://vercel.com/dashboard
2. Click: **gmail-ai-backend** project
3. Go to: **Deployments** → **Latest deployment**
4. Click: **"Function Logs"** or **"Logs"** tab
5. **Keep this page open**
6. **Try generating an AI response** in your extension
7. **Watch the logs** appear in real-time

### What to Look For:

**Look for these log entries:**
- `OpenAI API Error:` - Shows the actual error
- `hasApiKey: true` or `hasApiKey: false` - Confirms key detection
- `AI generation failed:` - Shows the error message
- `Full error details:` - Shows complete error object

**Common errors you might see:**

1. **"API key not found"**
   - Key not set in environment variables
   - Solution: Add `OPENAI_API_KEY` to Vercel

2. **"Invalid API key"**
   - Key is wrong or expired
   - Solution: Generate new key from OpenAI dashboard

3. **"Model 'gpt-4-turbo-preview' not found"**
   - Model name issue (I changed it to `gpt-4o-mini`)
   - Solution: Redeploy to get latest code

4. **"Rate limit exceeded"**
   - Too many requests
   - Solution: Wait a few minutes

5. **"Insufficient quota"**
   - No credits in OpenAI account
   - Solution: Add credits at platform.openai.com

## Step 2: Share the Error

**Copy the exact error message** from the Vercel logs and share it. This will tell us exactly what's wrong!

## Step 3: Verify Model Name

I changed the model from `gpt-4-turbo-preview` to `gpt-4o-mini` for better availability. Make sure the latest deployment has this change:

1. Check deployment logs for: `Switch to gpt-4o-mini model`
2. If not there, the deployment might be using old code

## Quick Test

After checking logs, you can also test directly:

```bash
curl -X POST https://gmail-ai-backend.vercel.app/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emailContent":{"subject":"Test","sender":"test@example.com","body":"Test"},"style":"brief","mode":"response"}'
```

---

**The Vercel logs will show us the exact error! Check them and share what you see.** 📋
