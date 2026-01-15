# ✅ Final OAuth Setup (Corrected)

## Correct Extension IDs

- **Testing:** `jjpbalnpbnmhbliggpoemmdceikojpld` (Unpacked/local testing)
- **Live:** `oicpmfbmankanehinmchmbakcjmlmodc` (Chrome Web Store)

## Current OAuth Client Check

Your current OAuth client: `999965368356-dld915f834eng8q772pqr29sndjjr7uv...`

**Check its Application ID:**
- Is it `jjpbalnpbnmhbliggpoemmdceikojpld`? → Good for TESTING ✅
- Is it `oicpmfbmankanehinmchmbakcjmlmodc`? → Good for LIVE ✅
- Or something else? → Need to update

## Recommended: Fix Testing First, Then Live

### Step 1: Fix Testing Version

1. **Check current OAuth client:**
   - Go to: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Find: `999965368356-dld915f834eng8q772pqr29sndjjr7uv...`
   - Click to view details
   - Check "Application ID"

2. **If Application ID is NOT `jjpbalnpbnmhbliggpoemmdceikojpld`:**
   - Click **Edit**
   - Update Application ID to: `jjpbalnpbnmhbliggpoemmdceikojpld`
   - Save

3. **If Application ID is already `jjpbalnpbnmhbliggpoemmdceikojpld`:**
   - Good! Already configured ✅

4. **Test:**
   - Reload testing extension: `chrome://extensions/` → reload
   - Try Google sign-in on testing version
   - Should work! ✅

### Step 2: Create OAuth Client for Live

Once testing works:

1. **Create new OAuth client:**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - **Application type:** Chrome Extension
   - **Application ID:** `oicpmfbmankanehinmchmbakcjmlmodc` (live Extension ID)
   - **Name:** "Inkwell - Live" (optional)
   - Click **"Create"**

2. **Test live version:**
   - Reload live extension: `chrome://extensions/` → reload
   - Try Google sign-in on live version
   - Should work! ✅

## Final Setup

You'll have **TWO** OAuth clients:

| OAuth Client | Application ID | For |
|-------------|---------------|-----|
| Testing | `jjpbalnpbnmhbliggpoemmdceikojpld` | Testing version |
| Live | `oicpmfbmankanehinmchmbakcjmlmodc` | Live version |

## Quick Action

**First, check your current OAuth client:**
- What Application ID does it have?
- If it's `jjpbalnpbnmhbliggpoemmdceikojpld` → Good for testing! ✅
- If it's `oicpmfbmankanehinmchmbakcjmlmodc` → Good for live! ✅
- If it's different → Update it to `jjpbalnpbnmhbliggpoemmdceikojpld` for testing first

---

**Start with testing version, then create second OAuth client for live!**
