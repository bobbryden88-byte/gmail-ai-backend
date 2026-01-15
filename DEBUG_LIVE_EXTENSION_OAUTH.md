# 🔍 Debug Live Extension OAuth - "Bad Client ID"

## Live Extension Details

- **Extension ID:** `oicpmfbmankanehinmchmbakcjmlmodc` (from Chrome Web Store)
- **Error:** "bad client id: {0}"
- **OAuth Client:** Should be configured for `oicpmfbmankanehinmchmbakcjmlmodc`

## Critical Checks

### Step 1: Verify OAuth Client Item ID

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find your OAuth client (the one you just updated)
4. **Click to view details**
5. **Check "Item ID" field:**
   - Should be: `oicpmfbmankanehinmchmbakcjmlmodc`
   - **Does it match EXACTLY?** (32 characters, no spaces)

**If it doesn't match:**
- Click **Edit**
- Update Item ID to: `oicpmfbmankanehinmchmbakcjmlmodc` (paste exactly)
- Save
- Wait 5 minutes
- Try again

### Step 2: Verify OAuth Client Type

In the OAuth client details:
- **Type:** Should be "Chrome Extension" ✅
- **NOT** "Web application" ❌
- **NOT** "Chrome App" ❌

### Step 3: Check OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. **Is it configured?**
   - User Type: External (or Internal)
   - App name: Something (not empty)
   - Your email
   - Publishing status: Testing or In production

**If not configured:**
- Configure it now (User Type: External, App name: Inkwell, your email)
- Save through all steps

### Step 4: Complete Chrome Restart

1. **Close ALL Chrome windows** (completely exit Chrome)
2. **Wait 2 minutes**
3. **Reopen Chrome**
4. Go to: `chrome://extensions/`
5. **Reload live extension** (click reload button)
6. **Try Google sign-in again**

### Step 5: Wait for Propagation

If you just created/updated the OAuth client:
- **Wait 10-15 minutes** (Google can take time)
- **Then try again**

## Most Likely Issues

### Issue 1: Item ID Doesn't Match Exactly
- OAuth client Item ID: `________________`
- Extension ID: `oicpmfbmankanehinmchmbakcjmlmodc`
- **They must match exactly!**

### Issue 2: OAuth Consent Screen Not Configured
- Most common issue when Extension ID matches
- **Fix:** Configure OAuth consent screen

### Issue 3: Wrong OAuth Client Type
- Should be "Chrome Extension" (not "Web application")
- **Fix:** Delete and recreate as "Chrome Extension"

## Quick Verification

**Check these in Google Cloud Console:**

1. **OAuth client Item ID:** `________________`
   - Should be: `oicpmfbmankanehinmchmbakcjmlmodc`
   
2. **OAuth client Type:** `________________`
   - Should be: "Chrome Extension"

3. **OAuth consent screen configured?** Yes / No
   - If No → Configure it

---

**Most likely: Item ID doesn't match exactly, or OAuth consent screen isn't configured. Check both!**
