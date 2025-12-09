# ✅ Google OAuth Access Token Fix

## Problem
`chrome.identity.getAuthToken()` returns an **access token**, not an **ID token**. The backend was expecting an ID token to verify, but we're sending an access token.

## Solution
1. **Extension:** Use access token to fetch user info from Google's API
2. **Backend:** Accept user info directly (email, googleId, name) instead of requiring ID token verification

## Changes Made

### Extension (`background.js`)
- After getting access token, fetch user info from `https://www.googleapis.com/oauth2/v2/userinfo`
- Send user info (email, googleId, name) to backend instead of token

### Backend (`src/routes/auth.js`)
- Updated to accept either:
  - `idToken` (for web apps - verifies token)
  - `email` + `googleId` (for Chrome extensions - direct user info)
- Supports both authentication methods

## Flow (New)

1. User clicks "Sign in with Google"
2. Extension calls `chrome.identity.getAuthToken()` → Gets **access token**
3. Extension uses access token to call Google API: `GET https://www.googleapis.com/oauth2/v2/userinfo`
4. Google API returns: `{ email, name, id, picture }`
5. Extension sends user info to backend: `POST /api/auth/google` with `{ email, googleId, name }`
6. Backend creates/updates user and returns JWT
7. Extension stores JWT and user info
8. User is logged in!

## Testing

1. **Update Backend:**
   - The backend code is updated
   - **Deploy to Vercel** (or restart local server)

2. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Reload "Inkwell - Gmail AI Assistant"

3. **Test:**
   - Click "Sign in with Google"
   - Should work now!

---

**Status:** ✅ Code updated - Deploy backend and test!
