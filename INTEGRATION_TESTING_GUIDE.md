# 🧪 Email Summarization Integration - Testing Guide

## ✅ **Files Created**

1. **`api/auth-manager.js`** - OAuth token management for Gmail API
2. **`api/gmail-api.js`** - Gmail API wrapper
3. **`api/summarizer.js`** - Backend API caller for summarization

## ✅ **Files Modified**

1. **`manifest.json`** - Added `gmail.readonly` scope to oauth2
2. **`popup/auth.html`** - Added summarize button in user info section
3. **`popup/auth.js`** - Added summarize button click handler

---

## 🧪 **Testing Steps**

### Step 1: Load Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `/Users/bobbryden/gmail-ai-assistant`
5. Check for errors in the console

### Step 2: Check for Errors

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for any import/module errors
4. Check background script: Click "Inspect views: service worker" under your extension

### Step 3: Test Gmail Token Acquisition

1. Click extension icon
2. Log in (if not already)
3. Open browser console (F12)
4. Run this in console:
   ```javascript
   import('./api/auth-manager.js').then(m => {
     m.authManager.getGmailToken().then(token => {
       console.log('✅ Gmail token:', token.substring(0, 20) + '...');
     }).catch(err => {
       console.error('❌ Error:', err);
     });
   });
   ```

### Step 4: Test Summarize Button

1. Open Gmail: https://mail.google.com
2. Open any email
3. Click extension icon
4. Click "📧 Summarize Current Email" button
5. Check console for any errors
6. Verify summary appears in popup

### Step 5: Test Gmail API Directly

In browser console on Gmail page:
```javascript
import('./api/gmail-api.js').then(async m => {
  try {
    const email = await m.gmailAPI.getCurrentEmail();
    console.log('✅ Current email:', email);
  } catch (err) {
    console.error('❌ Error:', err);
  }
});
```

---

## 🐛 **Common Issues & Fixes**

### Issue 1: "Module not found" errors

**Solution:**
- Check that `api/` folder exists
- Verify file paths are correct
- Ensure files use ES6 module syntax (`export`/`import`)

### Issue 2: "Invalid OAuth2 Client ID"

**Solution:**
- Verify OAuth client in Google Cloud Console has `gmail.readonly` scope
- Check Item ID matches Extension ID
- Wait 5-10 minutes after updating OAuth client

### Issue 3: "Failed to get Gmail token"

**Solution:**
- User needs to grant Gmail permissions
- Check Chrome Identity API is working
- Verify manifest has correct scopes

### Issue 4: "Backend error: 404" or "Endpoint not found"

**Solution:**
- Verify backend has `/api/summarize` endpoint
- Check backend URL is correct: `https://gmail-ai-backend.vercel.app`
- Test endpoint directly with curl:
  ```bash
  curl -X POST https://gmail-ai-backend.vercel.app/api/summarize \
    -H "Content-Type: application/json" \
    -d '{"email":{"subject":"Test","sender":"test@test.com","body":"Test email"}}'
  ```

### Issue 5: "No email found"

**Solution:**
- Make sure you're viewing an email in Gmail (not inbox list)
- Email URL should contain `/mail/u/0/#inbox/` or similar
- Try refreshing Gmail page

---

## 📋 **Checklist**

- [ ] Extension loads without errors
- [ ] No console errors in DevTools
- [ ] Gmail token can be acquired
- [ ] Summarize button appears in popup
- [ ] Summarize button works when email is open
- [ ] Summary displays correctly
- [ ] Backend endpoint responds correctly

---

## 🔍 **Debug Commands**

### Check if files are accessible:
```javascript
// In extension popup console
fetch(chrome.runtime.getURL('api/auth-manager.js'))
  .then(r => r.text())
  .then(t => console.log('✅ File exists'))
  .catch(e => console.error('❌ File not found:', e));
```

### Test auth manager:
```javascript
import('./api/auth-manager.js').then(m => {
  console.log('Auth manager loaded:', m.authManager);
});
```

### Test Gmail API:
```javascript
import('./api/gmail-api.js').then(async m => {
  const email = await m.gmailAPI.getUserEmail();
  console.log('User email:', email);
});
```

### Test summarizer:
```javascript
import('./api/summarizer.js').then(async m => {
  const result = await m.summarizer.summarizeCurrentEmail();
  console.log('Summary result:', result);
});
```

---

## 🚀 **Next Steps**

1. Test all functionality
2. Fix any errors found
3. Update version in manifest.json
4. Package for Chrome Web Store
5. Test with real emails

**Good luck! 🎉**
