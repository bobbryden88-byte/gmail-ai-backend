# 🔍 How to Get Your Chrome Extension ID

## Quick Steps:

1. **Open Chrome** browser
2. **Go to**: `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top right)
4. **Find**: Gmail AI Assistant
5. **Look for "ID:"** under the extension name
6. **Copy the ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

## What to Do With It:

Once you have the Extension ID, I'll update the backend to redirect to your extension's reset password page.

**For example, if your Extension ID is**: `abcdefgh12345678`

Then the reset URL will be:
```
chrome-extension://abcdefgh12345678/reset-password.html?token=xxx
```

## 🎯 **Please reply with your Extension ID and I'll update the backend for you!**

---

## Alternative: Let Backend Auto-Detect

The backend can also use a generic redirect page that works without knowing the Extension ID. This is simpler but requires an extra step.

Which approach do you prefer?
1. **Tell me your Extension ID** - I'll hardcode it (faster for you)
2. **Use generic redirect** - Works with any extension ID (more flexible)
