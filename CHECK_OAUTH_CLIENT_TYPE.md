# 🔍 Check OAuth Client Type

## Current OAuth Client Details
- **Name:** Inkwell Gmail AI Assistant Extension
- **Client ID:** `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`
- **Item ID:** `oicpmfbmankanehinmchmbakcjmlmodc` (Chrome Web Store ID)

## ⚠️ Critical Check Needed

**I need to see the "Application type" field.** It should say **"Chrome Extension"**.

### How to Check:

1. On the OAuth client details page you're viewing
2. **Scroll down** or look for a field labeled:
   - "Application type"
   - "Type"
   - "Client type"
3. **What does it say?**
   - ✅ **"Chrome Extension"** = Correct (but still getting error, so there's another issue)
   - ❌ **"Web Application"** = Wrong! This is the problem

## If Application Type is "Web Application"

You need to create a **NEW** OAuth client:

1. Go back to **Credentials** page
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type:** Select **"Chrome Extension"** (NOT Web Application!)
4. **Name:** "Inkwell Gmail AI Assistant Extension v2" (or any name)
5. **Item ID:** Leave **EMPTY** (don't use the Chrome Web Store ID)
6. Click **"CREATE"**
7. **Copy the NEW Client ID** (will be different from current one)

## If Application Type is "Chrome Extension"

Then the issue might be:
1. **Client ID mismatch** - Check manifest.json has exact same ID
2. **Extension not reloaded** - Reload extension after any changes
3. **Cached credentials** - Try in incognito mode
4. **Timing issue** - Google says "may take 5 minutes to a few hours"

## Next Steps

**Please tell me:**
1. What does "Application type" say? (Chrome Extension or Web Application?)
2. If it's "Web Application", create a new "Chrome Extension" client and share the new Client ID
3. If it's "Chrome Extension", we'll investigate further

---

**The error "bad client id" almost always means the OAuth client type is wrong!**
