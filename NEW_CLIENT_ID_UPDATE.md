# ✅ New OAuth Client ID - Update Complete

## New Client ID
```
999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com
```

## ✅ Files Updated

1. **Extension `manifest.json`** - Updated with new Client ID
2. **Backend `env.template`** - Updated with new Client ID

## 📝 Action Required

### 1. Update Backend `.env` File
**File:** `/Users/bobbryden/gmail-ai-backend/.env`

Update or add:
```
GOOGLE_CLIENT_ID="999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com"
```

### 2. Update Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. **Settings** → **Environment Variables**
4. Find `GOOGLE_CLIENT_ID`
5. **Update** with new value: `999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com`
6. **Redeploy** the project

### 3. Reload Extension
1. Go to `chrome://extensions/`
2. Find "Inkwell - Gmail AI Assistant"
3. Click **reload** icon
4. Wait for reload to complete

### 4. Test Google Sign-In
1. Go to Gmail
2. Click AI assistant button
3. Onboarding modal appears
4. Click **"Sign in with Google"**
5. Google OAuth popup should appear
6. Select your Google account
7. Modal should close automatically
8. You should be logged in!

## ✅ Checklist

- [x] New OAuth client created (Chrome Extension type)
- [x] Item ID set to Extension ID (or empty)
- [x] Extension manifest.json updated
- [x] Backend env.template updated
- [ ] Backend `.env` file updated (DO THIS NOW)
- [ ] Vercel environment variable updated (DO THIS NOW)
- [ ] Extension reloaded
- [ ] Google sign-in tested

## 🎯 Expected Result

After updating `.env` and Vercel, and reloading the extension:
- ✅ "Sign in with Google" button works
- ✅ Google OAuth popup appears
- ✅ After selecting account, user is logged in
- ✅ Onboarding modal closes automatically

---

**Status:** ✅ Files updated - Ready for testing after you update `.env` and Vercel!
