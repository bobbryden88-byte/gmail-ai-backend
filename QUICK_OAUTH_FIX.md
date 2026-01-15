# ⚡ Quick OAuth Fix Checklist

## ✅ Do These Steps in Order

### 1. Get Extension ID (2 minutes)
```
1. Open: chrome://extensions/
2. Enable Developer mode
3. Copy Extension ID (32 characters)
```

### 2. Configure Google Cloud Console (5 minutes)
```
1. Go to: console.cloud.google.com
2. Select your project
3. APIs & Services → Credentials
4. Create Credentials → OAuth client ID
5. Application type: Chrome App
6. Application ID: [Paste Extension ID]
7. Create
```

### 3. Wait & Test (2 minutes)
```
1. Wait 1-2 minutes
2. Reload extension in chrome://extensions/
3. Try Google sign-in
4. Should work!
```

## 🔴 Still Getting Error?

### Check These:

- [ ] Extension ID copied correctly (32 chars, no spaces)
- [ ] OAuth client type is "Chrome App" (not "Web application")
- [ ] Application ID in OAuth client matches Extension ID exactly
- [ ] OAuth consent screen is configured
- [ ] Waited 1-2 minutes after creating OAuth client
- [ ] Reloaded extension after configuration

## 📞 Need Help?

If still not working, check:
1. Browser console errors (F12 → Console)
2. Extension service worker logs (chrome://extensions/ → Inspect)
3. Vercel backend logs (for any backend errors)

---

**Backend is ready** ✅ - Just need Google Cloud Console configuration!
