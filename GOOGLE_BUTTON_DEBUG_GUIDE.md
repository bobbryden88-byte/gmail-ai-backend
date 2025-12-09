# 🐛 Google Sign-In Button Debug Guide

## Current Status
Button click is detected (`GAI: Google sign-in button clicked (addEventListener fallback)`) but nothing happens.

## Debugging Steps

### Step 1: Check Content Script Console
After clicking the button, you should see:
```
GAI: Google sign-in button clicked (fallback handler)
GAI: Sending message to background script...
GAI: chrome.runtime available? true
GAI: chrome.runtime.sendMessage available? true
GAI: Message payload: {action: "googleSignIn", source: "onboardingModal"}
GAI: sendMessage returned: undefined
GAI: Response callback called
GAI: Received response from background: {...}
```

### Step 2: Check Background Script Console
1. Go to `chrome://extensions/`
2. Find "Inkwell - Gmail AI Assistant"
3. Click **"Inspect views: service worker"**
4. In the console, you should see:
```
GAI Background: Google sign-in requested
GAI Background: Google token obtained
GAI Background: Exchanging token for JWT...
GAI Background: Backend response: {...}
GAI Background: User logged in via Google, sending response
```

### Step 3: Common Issues

#### Issue 1: No logs in background console
**Problem:** Background script not receiving message
**Check:**
- Is background script running? (Check "Inspect views: service worker")
- Is extension enabled?
- Try reloading extension

#### Issue 2: "chrome.runtime.lastError" in response
**Problem:** Message couldn't be sent
**Check:**
- Background script might be sleeping (service workers can sleep)
- Try clicking button again
- Check for errors in background console

#### Issue 3: Response is undefined
**Problem:** Background script didn't call sendResponse
**Check:**
- Look for errors in background console
- Verify handler returns `true` for async response

#### Issue 4: Google OAuth popup doesn't appear
**Problem:** `chrome.identity.getAuthToken()` failing
**Check:**
- Are you signed into Chrome?
- Check manifest.json has `identity` permission
- Check OAuth2 config in manifest.json

## Quick Test

Run this in the browser console on Gmail page:
```javascript
chrome.runtime.sendMessage({
  action: 'googleSignIn',
  source: 'test'
}, (response) => {
  console.log('Test response:', response);
  console.log('Error:', chrome.runtime.lastError);
});
```

Then check background script console for logs.

## Expected Flow

1. **Content Script:** Button clicked → sends message
2. **Background Script:** Receives message → calls `chrome.identity.getAuthToken()`
3. **Chrome:** Shows Google OAuth popup
4. **User:** Selects Google account
5. **Background Script:** Gets token → exchanges for JWT → stores credentials → sends response
6. **Content Script:** Receives response → hides modal

## Files to Check

1. `background.js` - Line 20-84 (Google sign-in handler)
2. `content/gmail-content.js` - Line 347-410 (Button handler)
3. `manifest.json` - Check `identity` permission and `oauth2` config

---

**Next:** Check both consoles and share what you see!
