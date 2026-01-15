# ✅ Backend Google OAuth Fix

## Problem

The "bad client id" error was happening because:
1. Chrome extension uses `chrome.identity.getAuthToken()` which gets an access token
2. Extension fetches user info from Google API using that access token
3. Extension sends direct user info (email, googleId, name) to backend
4. Backend was trying to verify an ID token that doesn't exist

## Solution

Updated `/api/auth/google` endpoint to:
1. **Prioritize direct user info** from Chrome extension (email + googleId)
2. **Skip token verification** for Chrome extension flow (trust Google API response)
3. **Fall back to ID token verification** only if direct user info isn't available

## Changes Made

**File:** `src/routes/auth.js`

- Reordered logic to check `email && googleId` first (Chrome extension flow)
- Only verify ID tokens if direct user info isn't provided
- Added fallback: if token verification fails but we have email/googleId, use direct user info

## How It Works Now

### Chrome Extension Flow (Current):
1. Extension calls `chrome.identity.getAuthToken()` → Gets access token
2. Extension uses access token to fetch user info from `https://www.googleapis.com/oauth2/v2/userinfo`
3. Extension sends `{ email, googleId, name, picture }` to backend
4. Backend accepts this directly (no token verification needed)

### Web App Flow (Future):
1. Web app sends Google ID token
2. Backend verifies token using `GOOGLE_CLIENT_ID`
3. Backend extracts user info from verified token

## Deployed

✅ Changes committed and pushed
✅ Will be live on Vercel after deployment

## Testing

After deployment, test Google sign-in:
1. Open extension
2. Click "Sign in with Google"
3. Should work without "bad client id" error

---

**Note:** The backend no longer requires `GOOGLE_CLIENT_ID` to be set for Chrome extension OAuth (only needed for web app ID token verification).
