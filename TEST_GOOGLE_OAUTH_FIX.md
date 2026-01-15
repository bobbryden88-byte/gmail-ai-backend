# 🧪 How to Test Google OAuth Fix

## Testing Steps

### Step 1: Verify Backend is Deployed

The backend fix is already deployed. Check it's live:

```bash
curl https://gmail-ai-backend.vercel.app/health
```

Should return: `{"status":"OK",...}`

### Step 2: Configure OAuth Client in Google Cloud Console

**This is the main fix needed:**

1. **Get Your Extension ID:**
   - Open Chrome
   - Go to: `chrome://extensions/`
   - Enable Developer mode
   - Find "Inkwell - Gmail AI Assistant"
   - Copy the Extension ID (32 characters)

2. **Configure OAuth Client:**
   - Go to: https://console.cloud.google.com/
   - Select your project
   - **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - **Application type:** Select **"Chrome App"**
   - **Application ID:** Paste your Extension ID
   - Click **"Create"**
   - **Note the Client ID** (you don't need to use it, Chrome will use it automatically)

### Step 3: Test Google Sign-In

1. **Reload the Extension:**
   - Go to: `chrome://extensions/`
   - Find your extension
   - Click the **reload icon** (circular arrow)

2. **Test Sign-In:**
   - Open Gmail: https://mail.google.com
   - Click the extension icon
   - Click **"Sign in with Google"**
   - Should see Google OAuth popup (not error)
   - Select your Google account
   - Should successfully sign in

### Step 4: Verify It Works

**Success indicators:**
- ✅ No "bad client id" error
- ✅ Google OAuth popup appears
- ✅ You can select your Google account
- ✅ Sign-in completes successfully
- ✅ You see your account info in the extension

**If it still fails:**
- Check browser console for errors
- Verify Extension ID matches in Google Cloud Console
- Make sure OAuth client type is "Chrome App" (not "Web Application")

## Quick Test Commands

### Test Backend Endpoint

```bash
# Test health
curl https://gmail-ai-backend.vercel.app/health

# Test Google OAuth endpoint (will fail without proper auth, but should not return "bad client id")
curl -X POST https://gmail-ai-backend.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","googleId":"123456"}'
```

### Check Vercel Logs

1. Go to: https://vercel.com/dashboard
2. Select: `gmail-ai-backend`
3. Go to: **Deployments** → Latest → **Functions** tab
4. Look for `/api/auth/google` logs
5. Should see: `"Using direct user info from Chrome extension"`

## Expected Behavior

### Before Fix:
- ❌ "bad client id" error
- ❌ Google sign-in fails immediately

### After Fix:
- ✅ Google OAuth popup appears
- ✅ Can select Google account
- ✅ Sign-in succeeds
- ✅ User info displayed in extension

## Troubleshooting

### Still Getting "Bad Client ID"?

1. **Verify Extension ID:**
   - Make sure you copied the correct Extension ID
   - It should be 32 characters
   - Check it matches in Google Cloud Console

2. **Check OAuth Client Type:**
   - Must be **"Chrome App"** (not "Web Application")
   - Application ID must be your Extension ID

3. **Wait a Few Minutes:**
   - Google Cloud Console changes can take 1-2 minutes to propagate

4. **Clear Chrome Cache:**
   - Close all Chrome windows
   - Reopen Chrome
   - Try again

### Check Browser Console

1. Open Gmail
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Try Google sign-in
5. Look for errors

### Check Extension Logs

1. Go to: `chrome://extensions/`
2. Find your extension
3. Click **"Inspect views: background page"** (or service worker)
4. Check Console for errors

---

**The fix is deployed!** Just need to configure the OAuth client in Google Cloud Console.
