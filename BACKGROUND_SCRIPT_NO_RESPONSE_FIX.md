# 🔧 Background Script "No Response" Fix

## Problem
Error: "No response from extension" - Background script not responding to messages.

## Possible Causes
1. **Background script is sleeping** (service workers can sleep)
2. **Message handler not registered** properly
3. **sendResponse not being called** in error cases
4. **Timeout too short** (5 seconds might not be enough for OAuth flow)

## Fixes Applied

### 1. Extended Timeout
- Changed from 5 seconds to 30 seconds
- Google OAuth flow can take time (user interaction, API calls)

### 2. Better Error Handling
- Ensured `sendResponse` is called in all error cases
- Added try-catch around `sendResponse` calls

### 3. Response Tracking
- Added `responseReceived` flag to track if response was received
- Prevents false timeout errors

## Testing

### Step 1: Check Background Script is Running
1. Go to `chrome://extensions/`
2. Find "Inkwell - Gmail AI Assistant"
3. Click **"Inspect views: service worker"**
4. Console should be open
5. Look for any errors

### Step 2: Test Message Sending
In the background script console, run:
```javascript
chrome.runtime.onMessage.hasListeners()
```
Should return `true`

### Step 3: Reload Extension
1. Go to `chrome://extensions/`
2. Click **reload** on your extension
3. Wait 5 seconds for service worker to start

### Step 4: Test Google Sign-In
1. Go to Gmail
2. Click AI assistant button
3. Click "Sign in with Google"
4. **Watch background script console** for logs
5. Should see: `GAI Background: Google sign-in requested`

## Debugging

### If Background Script Console Shows Errors:
- Check for import errors
- Check for syntax errors
- Verify all dependencies are available

### If No Logs Appear:
- Background script might not be running
- Try reloading extension
- Check manifest.json for background script path

### If Message Handler Not Working:
- Verify `chrome.runtime.onMessage.addListener` is registered
- Check if service worker is active
- Try sending a test message

## Quick Test

Run this in background script console:
```javascript
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Test message received:', msg);
  sendResponse({ test: 'ok' });
  return true;
});
```

Then in content script console (Gmail page):
```javascript
chrome.runtime.sendMessage({ test: true }, (response) => {
  console.log('Response:', response);
});
```

---

**Status:** ✅ Fixes applied - Reload extension and test!
