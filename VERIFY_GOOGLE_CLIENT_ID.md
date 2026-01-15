# 🔍 Verify GOOGLE_CLIENT_ID in Vercel

## The Issue

The "bad client id" error happens when `chrome.identity.getAuthToken()` is called. However, since your extension sends direct user info (not ID tokens), the backend doesn't actually need `GOOGLE_CLIENT_ID` for Chrome extension OAuth.

## Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: `gmail-ai-backend`
3. Go to: **Settings** → **Environment Variables**
4. Check if `GOOGLE_CLIENT_ID` is set

## What to Do

### Option 1: Remove GOOGLE_CLIENT_ID (Recommended)

Since Chrome extension OAuth doesn't use ID token verification:
- You can remove `GOOGLE_CLIENT_ID` from Vercel
- The backend will work fine with direct user info from extension

### Option 2: Keep GOOGLE_CLIENT_ID (For Future Web App)

If you plan to add web app support later:
- Keep `GOOGLE_CLIENT_ID` in Vercel
- It won't affect Chrome extension OAuth (which uses direct user info)

## The Real Fix

The "bad client id" error is happening in Chrome, not the backend. To fix it properly, you need to:

1. **Configure OAuth Client in Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Type: **Chrome App**
   - Application ID: Your Chrome Extension ID (from `chrome://extensions/`)

2. **But since v1.1 is live**, you can't change the extension code.

## Workaround

Users can still use **email/password login** instead of Google sign-in until the next extension update.

---

**Backend fix is deployed** - it will handle Google OAuth correctly once the Chrome extension OAuth is properly configured in Google Cloud Console.
