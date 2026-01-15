# 🔍 Debug "Invalid OAuth2 Client ID" Error

## The Error

"Invalid OAuth2 Client ID" means Chrome can't find or use the OAuth client for your extension.

## Root Cause

`chrome.identity.getAuthToken()` requires:
1. OAuth client configured in Google Cloud Console
2. Client type: **Chrome App** (not Web Application)
3. Extension ID must match exactly

## Step-by-Step Fix

### Step 1: Get Your Exact Extension ID

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Find **"Inkwell - Gmail AI Assistant"**
5. **Copy the Extension ID** (it's a 32-character string)
   - Example format: `abcdefghijklmnopqrstuvwxyz123456`
   - **Copy this EXACTLY** - no spaces, no extra characters

### Step 2: Check Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Make sure you're in the **correct project**
3. Go to: **APIs & Services** → **Credentials**

### Step 3: Check Existing OAuth Clients

Look for any OAuth clients that might be related:
- Check if `999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com` exists
- Check its **Application type** - must be **"Chrome App"**
- Check its **Application ID** - must match your Extension ID exactly

### Step 4: Create New OAuth Client (Recommended)

**If no Chrome App client exists, create one:**

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. If you see "OAuth consent screen" warning:
   - Click **"Configure Consent Screen"**
   - User Type: **External**
   - App name: **Inkwell**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
   - Return to Credentials

3. Create OAuth client:
   - **Application type:** Select **"Chrome App"** (NOT "Web application")
   - **Application ID:** Paste your Extension ID (from Step 1)
   - Click **"Create"**

4. **Important:** You'll see a Client ID - you don't need to use this in code, Chrome handles it automatically

### Step 5: Verify Configuration

The OAuth client should show:
- ✅ **Type:** Chrome App
- ✅ **Application ID:** Your Extension ID (matches exactly)
- ✅ **Client ID:** (some long string - this is fine)

### Step 6: Test Again

1. **Wait 1-2 minutes** (Google needs time to propagate)
2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on your extension
3. **Test sign-in:**
   - Open Gmail
   - Click extension icon
   - Click "Sign in with Google"
   - Should work now!

## Common Mistakes

❌ **Wrong Application Type:**
- Using "Web application" instead of "Chrome App"
- Fix: Delete and recreate as "Chrome App"

❌ **Wrong Extension ID:**
- Extension ID doesn't match exactly
- Fix: Copy Extension ID again, make sure no spaces

❌ **Wrong Google Cloud Project:**
- OAuth client in different project
- Fix: Make sure you're in the correct project

❌ **OAuth Consent Screen Not Configured:**
- Can't create OAuth client without consent screen
- Fix: Configure consent screen first (Step 4 above)

## Alternative: Check Extension Logs

1. Go to: `chrome://extensions/`
2. Find your extension
3. Click **"Inspect views: service worker"** (or background page)
4. Go to **Console** tab
5. Try Google sign-in
6. Look for error messages

## Still Not Working?

### Check 1: Verify Extension ID Format
- Should be exactly 32 characters
- No dashes or spaces
- All lowercase letters and numbers

### Check 2: Verify OAuth Client
- Go to Google Cloud Console
- APIs & Services → Credentials
- Find your Chrome App OAuth client
- Verify Application ID matches Extension ID exactly

### Check 3: Try Different Browser Profile
- Sometimes Chrome caches OAuth settings
- Try in Incognito mode or different Chrome profile

### Check 4: Check Browser Console
- Open Gmail
- Press F12
- Go to Console tab
- Try sign-in
- Look for detailed error messages

---

**The backend is ready** - this is purely a Google Cloud Console configuration issue.
