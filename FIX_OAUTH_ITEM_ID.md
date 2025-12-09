# 🔧 Fix OAuth Item ID Mismatch

## Current Status
- ✅ OAuth client type: **Chrome Extension** (correct!)
- ❌ Item ID: `oicpmfbmankanehinmchmbakcjmlmodc` (Chrome Web Store ID)
- ✅ Extension ID: `jjpbalnpbnmhbliggpoemmdceikojpld` (from chrome://extensions/)

## Problem
The Item ID in the OAuth client is set to the Chrome Web Store ID, but for an unpacked extension (development), it should be:
- The Extension ID from `chrome://extensions/`, OR
- Left empty

## Solution: Update Item ID

### Option 1: Edit Existing OAuth Client (If Possible)
1. On the OAuth client details page
2. Look for an **"EDIT"** button
3. Change **Item ID** to: `jjpbalnpbnmhbliggpoemmdceikojpld`
4. Or leave it **empty**
5. Click **"SAVE"**

### Option 2: Create New OAuth Client (If Edit Not Available)
1. Go to **Credentials** page
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type:** Chrome Extension
4. **Name:** "Inkwell Gmail AI Assistant Extension"
5. **Item ID:** `jjpbalnpbnmhbliggpoemmdceikojpld` (Extension ID) OR leave empty
6. Click **"CREATE"**
7. Copy the new Client ID

## Alternative: Try Without Item ID

For unpacked extensions, the Item ID can often be left empty. Try:
1. Edit the OAuth client (if possible)
2. Clear/remove the Item ID field
3. Save
4. Test again

## After Updating

1. **Reload extension:**
   - Go to `chrome://extensions/`
   - Reload "Inkwell - Gmail AI Assistant"

2. **Test Google sign-in:**
   - Click "Sign in with Google" button
   - Should work now!

---

**Try editing the Item ID first. If that doesn't work or you can't edit it, create a new OAuth client with the correct Item ID (or empty).**
