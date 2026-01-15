# 🔧 Fix OAuth Client Type Issue

## The Problem

Your OAuth client shows:
- **Type:** Chrome Extension ❌
- **Needed:** Chrome App ✅

`chrome.identity.getAuthToken()` requires the OAuth client to be configured as **"Chrome App"**, not "Chrome Extension".

## Solution: Update OAuth Client

### Step 1: Get Your Extension ID

1. Open: `chrome://extensions/`
2. Enable Developer mode
3. Find "Inkwell - Gmail AI Assistant"
4. **Copy the Extension ID** (32 characters)

### Step 2: Update OAuth Client in Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find: "Inkwell Gmail AI Assistant Extension"
4. Click **Edit** (pencil icon)
5. **Application type:** Change to **"Chrome App"**
6. **Application ID:** Paste your Extension ID (from Step 1)
7. Click **Save**

**OR** if you can't edit the type:

1. **Delete** the existing OAuth client
2. **Create new one:**
   - Application type: **Chrome App**
   - Application ID: Your Extension ID
   - Create

### Step 3: Verify

The OAuth client should show:
- ✅ **Type:** Chrome App
- ✅ **Application ID:** Your Extension ID (32 characters)
- ✅ **Client ID:** (will be different, that's OK)

### Step 4: Test

1. **Wait 1-2 minutes** (Google needs time to update)
2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on your extension
3. **Test Google sign-in:**
   - Open Gmail
   - Click extension icon
   - Click "Sign in with Google"
   - Should work now!

## Why This Matters

- **Chrome Extension** type: For extensions that use web-based OAuth flows
- **Chrome App** type: For `chrome.identity.getAuthToken()` API (what you're using)

Since your extension uses `chrome.identity.getAuthToken()`, it **must** be "Chrome App" type.

---

**After updating to "Chrome App" type, Google sign-in should work!**
