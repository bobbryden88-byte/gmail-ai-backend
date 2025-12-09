# 🐛 Google OAuth Debug - Onboarding Modal Issue

## Problem Analysis

**Issue:** Clicking "Sign in with Google" shows onboarding modal instead of Google OAuth popup.

**Root Cause Hypothesis:**
1. `chrome.identity.getAuthToken()` might be failing silently
2. Error handling might be triggering onboarding modal
3. Global click handler might be intercepting the click
4. Event propagation issue

## Code Path Analysis

### Expected Flow:
```
User clicks "Sign in with Google"
  ↓
Event listener in auth.js (line 196)
  ↓
Calls AuthService.googleSignIn()
  ↓
chrome.identity.getAuthToken() (line 148)
  ↓
Google OAuth popup appears
```

### Actual Flow (Suspected):
```
User clicks "Sign in with Google"
  ↓
Global click handler (line 354?) intercepts
  ↓
OR chrome.identity.getAuthToken() fails
  ↓
Error triggers onboarding modal somehow
```

## Files to Check

1. **popup/auth.js** - Line 196 (Google button handler)
2. **popup/auth.js** - Line 354 (Global click handler)
3. **utils/auth-service.js** - Line 142 (googleSignIn method)
4. **manifest.json** - OAuth2 configuration

## Debugging Steps

### Step 1: Add Console Logging
Add detailed logging to trace the exact flow:

```javascript
// In popup/auth.js, line 196
googleSignInBtn.addEventListener('click', async (e) => {
  console.log('🔵 Google sign-in button clicked');
  console.log('Event:', e);
  console.log('Event target:', e.target);
  e.preventDefault();
  e.stopPropagation(); // ADD THIS
  
  // ... rest of code
});
```

### Step 2: Check for Global Click Handler
Look for `document.addEventListener('click', ...)` that might be intercepting.

### Step 3: Verify chrome.identity.getAuthToken
The issue might be that `chrome.identity.getAuthToken()` requires:
- User signed into Chrome
- Correct OAuth2 configuration in manifest
- Valid Client ID

### Step 4: Check Error Handling
If `chrome.identity.getAuthToken()` fails, where does the error go?

## Potential Fixes

### Fix 1: Stop Event Propagation
```javascript
googleSignInBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent bubbling
  e.stopImmediatePropagation(); // Prevent other handlers
  // ... rest
});
```

### Fix 2: Check chrome.identity Availability
```javascript
if (!chrome.identity) {
  console.error('chrome.identity API not available');
  return { success: false, error: 'Chrome Identity API not available' };
}
```

### Fix 3: Better Error Handling
```javascript
try {
  const googleToken = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      { interactive: true, scopes: [...] },
      (token) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome Identity Error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      }
    );
  });
} catch (error) {
  console.error('Google OAuth Error:', error);
  // Show specific error, not onboarding modal
}
```

## Next Steps

1. Add `e.stopPropagation()` to button handler
2. Add detailed console logging
3. Check browser console for errors
4. Verify manifest.json OAuth2 config
5. Test with Chrome signed in vs not signed in
