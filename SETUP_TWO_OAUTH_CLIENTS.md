# 🔧 Setup Two OAuth Clients (Testing + Live)

## Your Extension IDs

- **Testing:** `jjpbalnpbnmhbliggpoemmdceikojpld`
- **Live:** `oicpmfbmankanehinmchmbakcjmlmodc`

Since they're **different**, you need **TWO** OAuth clients.

## Step 1: Check Current OAuth Client

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find your OAuth client: `999965368356-dld915f834eng8q772pqr29sndjjr7uv...`
4. Click to view details
5. **Check Application ID:**
   - Which Extension ID is it set to?
   - Testing: `jjpbalnpbnmhbliggpoemmdceikojpld`?
   - Live: `oicpmfbmankanehinmchmbakcjmlmodc`?
   - Or something else?

## Step 2: Create OAuth Client for Testing (First)

### If Current OAuth Client is NOT for Testing:

1. **Create new OAuth client:**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - **Application type:** Chrome Extension
   - **Application ID:** `jjpbalnpbnmhbliggpoemmdceikojpld` (testing Extension ID)
   - **Name:** "Inkwell - Testing" (optional, for organization)
   - Click **"Create"**

2. **Test it:**
   - Reload testing extension: `chrome://extensions/` → reload
   - Try Google sign-in on testing version
   - Should work! ✅

### If Current OAuth Client IS for Testing:

1. **Verify Application ID matches:**
   - Should be: `jjpbalnpbnmhbliggpoemmdceikojpld`
   - If not, edit and update it

2. **Test it:**
   - Reload testing extension
   - Try Google sign-in
   - Should work! ✅

## Step 3: Create OAuth Client for Live (After Testing Works)

Once testing version works:

1. **Create second OAuth client:**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - **Application type:** Chrome Extension
   - **Application ID:** `oicpmfbmankanehinmchmbakcjmlmodc` (live Extension ID)
   - **Name:** "Inkwell - Live" (optional)
   - Click **"Create"**

2. **Test live version:**
   - Reload live extension: `chrome://extensions/` → reload
   - Try Google sign-in on live version
   - Should work! ✅

## Summary

You'll have **TWO** OAuth clients:

| OAuth Client | Application ID | For |
|-------------|---------------|-----|
| Inkwell - Testing | `jjpbalnpbnmhbliggpoemmdceikojpld` | Testing version |
| Inkwell - Live | `oicpmfbmankanehinmchmbakcjmlmodc` | Live version |

## Recommended Order

1. ✅ **First:** Fix testing version (create/update OAuth client with testing Extension ID)
2. ✅ **Test:** Verify Google sign-in works on testing version
3. ✅ **Then:** Create OAuth client for live Extension ID
4. ✅ **Deploy:** Live version will work automatically

## Quick Action

**Check your current OAuth client:**
- What Application ID does it have?
- If it's `jjpbalnpbnmhbliggpoemmdceikojpld` → Good for testing! ✅
- If it's `oicpmfbmankanehinmchmbakcjmlmodc` → Good for live! ✅
- If it's something else → Update it to match testing Extension ID first

---

**Start with testing version, then create second OAuth client for live!**
