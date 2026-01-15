# 🔍 Debug "Invalid OAuth2 Client ID" Error

## Still Getting Error After Creating New OAuth Client?

Let's verify everything is configured correctly.

## Step 1: Verify Extension ID Matches

### Get Your Extension ID:
1. Open: `chrome://extensions/`
2. Enable Developer mode
3. Find "Inkwell - Gmail AI Assistant"
4. **Copy the Extension ID** (32 characters)
   - Example: `abcdefghijklmnopqrstuvwxyz123456`

### Check in Google Cloud Console:
1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find your OAuth client: `999965368356-dld915f834eng8q772pqr29sndjjr7uv...`
4. Click on it to view details
5. **Check "Application ID" field:**
   - Does it match your Extension ID **exactly**?
   - Same 32 characters?
   - No spaces or extra characters?

**If they don't match:** Edit the OAuth client and update the Application ID.

## Step 2: Verify OAuth Client Type

In Google Cloud Console, check:
- **Type:** Should be "Chrome Extension" ✅
- **Application ID:** Should match Extension ID exactly ✅

## Step 3: Clear Chrome Cache

Chrome might be caching the old OAuth client:

1. **Close all Chrome windows**
2. **Reopen Chrome**
3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on your extension
4. **Try sign-in again**

## Step 4: Check Browser Console

1. Open Gmail
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try Google sign-in
5. Look for detailed error messages
6. **Copy any errors** you see

## Step 5: Check Extension Service Worker Logs

1. Go to: `chrome://extensions/`
2. Find your extension
3. Click **"Inspect views: service worker"** (or background page)
4. Go to **Console** tab
5. Try Google sign-in
6. Look for errors like:
   - "Invalid OAuth2 Client ID"
   - "bad client id"
   - Any other error messages

## Step 6: Verify OAuth Consent Screen

Make sure OAuth consent screen is configured:

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Should show:
   - User Type: External (or Internal)
   - App name: Something (not empty)
   - Your email

If not configured, configure it:
- User Type: **External**
- App name: **Inkwell**
- Your email
- Save through all steps

## Step 7: Wait Longer

Sometimes Google takes 5-10 minutes to propagate OAuth changes:

1. **Wait 5-10 minutes** after creating OAuth client
2. **Reload extension**
3. **Try again**

## Step 8: Verify OAuth Client is Active

In Google Cloud Console:
1. Go to **Credentials**
2. Find your OAuth client
3. Make sure it's **not disabled**
4. Status should be **Active**

## Common Issues

### Issue 1: Application ID Mismatch
- **Symptom:** Extension ID doesn't match Application ID in OAuth client
- **Fix:** Update Application ID in OAuth client to match Extension ID exactly

### Issue 2: Wrong OAuth Client
- **Symptom:** Multiple OAuth clients, using wrong one
- **Fix:** Delete old ones, use only the new "Chrome Extension" type

### Issue 3: OAuth Consent Screen Not Configured
- **Symptom:** Can't create OAuth client or it's not working
- **Fix:** Configure OAuth consent screen first

### Issue 4: Chrome Cache
- **Symptom:** Still using old client ID
- **Fix:** Close Chrome completely, reopen, reload extension

## What to Check Next

After verifying all above, check:

1. **Extension ID from `chrome://extensions/`:** `________________`
2. **Application ID in OAuth client:** `________________`
3. **Do they match exactly?** Yes / No

If they don't match, that's the problem! Update the Application ID in the OAuth client.

---

**Most likely issue:** Application ID in OAuth client doesn't match Extension ID exactly. Double-check this!
