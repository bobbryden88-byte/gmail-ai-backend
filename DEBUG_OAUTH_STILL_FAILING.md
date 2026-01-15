# 🔍 Debug "Invalid OAuth2 Client ID" - Still Failing

## The Error

Background script is returning: `{success: false, error: 'Invalid OAuth2 Client ID.'}`

This means `chrome.identity.getAuthToken()` is failing.

## Step 1: Verify Extension ID Matches Exactly

### Get Your Testing Extension ID:
1. Go to: `chrome://extensions/`
2. Enable Developer mode
3. Find your **testing** extension
4. **Copy Extension ID** (should be `jjpbalnpbnmhbliggpoemmdceikojpld`)

### Check in Google Cloud Console:
1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find: `999965368356-dld915f834eng8q772pqr29sndjjr7uv...`
4. Click to view details
5. **Check "Item ID" field:**
   - Should be: `jjpbalnpbnmhbliggpoemmdceikojpld`
   - **Does it match EXACTLY?** (32 characters, no spaces)

**If it doesn't match:**
- Click **Edit**
- Update Item ID to: `jjpbalnpbnmhbliggpoemmdceikojpld`
- Save

## Step 2: Check Background Script Logs

The error is coming from the background script. Check its logs:

1. Go to: `chrome://extensions/`
2. Find your extension
3. Click **"Inspect views: service worker"** (or "background page")
4. Go to **Console** tab
5. Try Google sign-in again
6. **Look for detailed error messages:**
   - What does `chrome.runtime.lastError` say?
   - Any specific error codes?
   - Copy the full error message

## Step 3: Clear Chrome OAuth Cache

Chrome might be caching the old OAuth client:

1. **Close ALL Chrome windows** (completely exit Chrome)
2. **Wait 30 seconds**
3. **Reopen Chrome**
4. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on your extension
5. **Try sign-in again**

## Step 4: Verify OAuth Client is Active

In Google Cloud Console:
1. Go to **Credentials**
2. Find your OAuth client
3. Make sure it's **not disabled**
4. Status should be **Active**

## Step 5: Wait for Propagation

Google can take 5-10 minutes to propagate OAuth changes:

1. **Wait 5-10 minutes** after creating/updating OAuth client
2. **Reload extension**
3. **Try again**

## Step 6: Check OAuth Consent Screen

Make sure OAuth consent screen is configured:

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Should show:
   - User Type: External (or Internal)
   - App name: Something (not empty)
   - Your email

If not configured:
- Configure it (User Type: External, App name: Inkwell, your email)
- Save through all steps

## Step 7: Verify Extension ID in Background

The background script might be using a different Extension ID. Check:

1. Open background script console (Step 2 above)
2. Try sign-in
3. Look for any logs showing which Extension ID Chrome is using
4. Compare with OAuth client Application ID

## Most Likely Issues

### Issue 1: Application ID Mismatch
- **Symptom:** Extension ID doesn't match Item ID in OAuth client
- **Fix:** Update Item ID in OAuth client to match Extension ID exactly

### Issue 2: Chrome Cache
- **Symptom:** Chrome still using old OAuth client
- **Fix:** Close Chrome completely, reopen, reload extension

### Issue 3: OAuth Not Propagated
- **Symptom:** Just created OAuth client, error still happens
- **Fix:** Wait 5-10 minutes, try again

### Issue 4: OAuth Consent Screen Not Configured
- **Symptom:** Can't use OAuth without consent screen
- **Fix:** Configure OAuth consent screen first

## What to Check Next

1. **Extension ID from `chrome://extensions/`:** `________________`
2. **Item ID in OAuth client:** `________________`
3. **Do they match exactly?** Yes / No
4. **Background script error:** `________________` (from console)

---

**Check the background script console for the detailed error message - that will tell us exactly what's wrong!**
