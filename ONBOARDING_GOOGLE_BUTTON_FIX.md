# ✅ Onboarding Modal Google Sign-In Button - Fixed

## Problem
The "Sign in with Google" button in the onboarding modal wasn't working because `chrome.identity.getAuthToken()` is not available in content scripts.

## Solution
Added a message handler in the background script that:
1. Receives the Google sign-in request from the content script
2. Calls `chrome.identity.getAuthToken()` (available in background scripts)
3. Exchanges the token for JWT via backend API
4. Stores credentials
5. Sends success response back to content script
6. Content script hides the onboarding modal

## Changes Made

### 1. Background Script (`background.js`)
- Added handler for `action: 'googleSignIn'` message
- Handles the full Google OAuth flow
- Returns success/error response

### 2. Onboarding Modal (`onboarding-modal.js`)
- Updated button click handler to send message to background
- Shows loading state while processing
- Hides modal on success
- Shows error message on failure

## User Flow

1. User clicks AI assistant button on Gmail
2. Onboarding modal appears
3. User clicks **"Sign in with Google"**
4. Button shows "Signing in..." (loading state)
5. Background script handles OAuth flow
6. Google OAuth popup appears
7. User selects Google account
8. Background script exchanges token for JWT
9. Credentials stored
10. Modal automatically closes
11. User is logged in!

## Testing

1. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Reload "Inkwell - Gmail AI Assistant"

2. **Clear State (optional):**
   ```javascript
   // In browser console on Gmail page
   chrome.storage.local.remove('onboardingSeen');
   chrome.storage.sync.remove('userToken');
   ```

3. **Test:**
   - Go to Gmail
   - Click AI assistant button
   - Onboarding modal appears
   - Click "Sign in with Google"
   - Google popup should appear
   - Select account
   - Modal should close automatically
   - User should be logged in

## Files Changed

1. `/Users/bobbryden/gmail-ai-assistant/background.js` - Added Google sign-in handler
2. `/Users/bobbryden/gmail-ai-assistant/content/onboarding-modal.js` - Updated button handler

## Debugging

If the button still doesn't work:

1. **Check browser console** (F12 → Console on Gmail page)
   - Look for: `GAI: Sign in with Google button clicked`
   - Look for: `GAI Background: Google sign-in requested`
   - Check for any error messages

2. **Check background script console:**
   - Go to `chrome://extensions/`
   - Find "Inkwell - Gmail AI Assistant"
   - Click "Inspect views: service worker"
   - Check console for errors

3. **Verify manifest.json:**
   - Check `"identity"` permission is present
   - Check `oauth2` configuration is correct

---

**Status:** ✅ Fixed - Ready for Testing
