# ✅ Phase 1 Complete - Next Steps

## Credentials Saved

**Client ID:** `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`

**Extension ID:** `jjpbalnpbnmhbliggpoemmdceikojpld`

**Redirect URI:** `https://jjpbalnpbnmhbliggpoemmdceikojpld.chromiumapp.org/`

## ✅ Files Updated

1. **Extension manifest.json** - Added `identity` permission and OAuth2 config
2. **Backend env.template** - Added `GOOGLE_CLIENT_ID` template

## 🔧 Action Required: Add Redirect URI in Google Cloud Console

**You need to add the redirect URI to your OAuth credentials:**

1. Go back to Google Cloud Console
2. **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID (the one you created)
4. Scroll down to **"Authorized redirect URIs"**
5. Click **"+ ADD URI"**
6. Enter: `https://jjpbalnpbnmhbliggpoemmdceikojpld.chromiumapp.org/`
7. Click **"SAVE"**

## 📝 Add Client ID to Backend .env

**You need to manually add this to your `.env` file:**

1. Open `/Users/bobbryden/gmail-ai-backend/.env`
2. Add this line:
   ```
   GOOGLE_CLIENT_ID="999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com"
   ```

**Also add to Vercel environment variables** (if deployed):
- Go to Vercel dashboard
- Project settings → Environment Variables
- Add: `GOOGLE_CLIENT_ID` = `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`

## ✅ Phase 1 Checklist

- [x] People API enabled
- [x] OAuth consent screen configured
- [x] OAuth client ID created
- [x] Extension ID obtained
- [ ] Redirect URI added to OAuth credentials (DO THIS NOW)
- [ ] Client ID added to backend .env file (DO THIS NOW)
- [x] Client ID added to extension manifest.json

## 🎯 Ready for Phase 2?

Once you've:
1. Added the redirect URI in Google Cloud Console
2. Added `GOOGLE_CLIENT_ID` to your backend `.env` file

Let me know and we'll proceed to **Phase 2: Database Schema Updates**!
