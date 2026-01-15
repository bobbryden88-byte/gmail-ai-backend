# 🧪 Test Google Login - Quick Setup

## Current Situation

- **Testing Extension ID:** `jjpbalnpbnmhbliggpoemmdceikojpld`
- **OAuth client:** Configured for `pdmhbofaobiabamoljhlgfikhkcmicdp` (different ID)
- **Need:** OAuth client for testing Extension ID to test Google login

## Quick Setup for Testing

### Option 1: Create OAuth Client for Testing Extension (Recommended)

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. **Application type:** Chrome Extension
5. **Item ID:** `jjpbalnpbnmhbliggpoemmdceikojpld` (testing Extension ID)
6. **Name:** "Inkwell - Testing"
7. Click **"Create"**
8. **Copy the Client ID**

9. **Update manifest.json** with the new testing client ID
10. **Reload testing extension**
11. **Test Google sign-in**

### Option 2: Update Existing OAuth Client

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find OAuth client: `944356653510-dr9mulo5d4cqaafdlhootl2ga8ibda3m...`
4. Click **Edit**
5. **Item ID:** Change to `jjpbalnpbnmhbliggpoemmdceikojpld` (testing Extension ID)
6. **Save**
7. **Wait 5 minutes**
8. **Reload testing extension**
9. **Test Google sign-in**

## After Setup

1. **Reload testing extension:** `chrome://extensions/` → reload
2. **Open Gmail:** https://mail.google.com
3. **Click extension icon**
4. **Click "Sign in with Google"**
5. **Should work!** ✅

---

**Create OAuth client for testing Extension ID `jjpbalnpbnmhbliggpoemmdceikojpld` and share the Client ID - I'll update manifest.json!**
