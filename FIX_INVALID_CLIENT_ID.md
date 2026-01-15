# 🔧 Fix "Invalid OAuth2 Client ID" - Chrome Can't Find OAuth Client

## The Problem

Chrome's `chrome.identity.getAuthToken()` can't find a valid OAuth client for Extension ID `jjpbalnpbnmhbliggpoemmdceikojpld`.

## Critical Check: Extension ID Must Match Exactly

### Step 1: Get Extension ID from Chrome

1. Go to: `chrome://extensions/`
2. Enable Developer mode
3. Find your **testing** extension
4. **Copy the Extension ID** (should be `jjpbalnpbnmhbliggpoemmdceikojpld`)
5. **Verify it's exactly 32 characters, no spaces**

### Step 2: Verify in Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find: `999965368356-dld915f834eng8q772pqr29sndjjr7uv...`
4. Click to view details
5. **Check "Item ID" field:**
   - Should be: `jjpbalnpbnmhbliggpoemmdceikojpld`
   - **Must match EXACTLY** (character by character)

**If they don't match:**
- Click **Edit**
- Update Item ID to match Extension ID exactly
- Save
- Wait 5 minutes
- Try again

## Step 3: Verify OAuth Client Type

Make sure the OAuth client shows:
- **Type:** Chrome Extension ✅
- **Item ID:** `jjpbalnpbnmhbliggpoemmdceikojpld` ✅

## Step 4: Check OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Should be configured:
   - User Type: External
   - App name: Something (not empty)
   - Your email

If not configured:
- Configure it now
- User Type: **External**
- App name: **Inkwell**
- Your email
- Save through all steps

## Step 5: Complete Chrome Restart

1. **Close ALL Chrome windows** (completely exit)
2. **Wait 1 minute**
3. **Reopen Chrome**
4. **Go to:** `chrome://extensions/`
5. **Reload extension** (click reload button)
6. **Try sign-in again**

## Step 6: Wait for Propagation

If you just created/updated the OAuth client:
- **Wait 10 minutes** (Google needs time)
- **Then try again**

## Alternative: Delete and Recreate OAuth Client

If it still doesn't work:

1. **Delete the current OAuth client**
2. **Wait 2 minutes**
3. **Create new OAuth client:**
   - Application type: **Chrome Extension**
   - Item ID: `jjpbalnpbnmhbliggpoemmdceikojpld` (paste exactly)
   - Name: "Inkwell - Testing"
   - Create
4. **Wait 10 minutes**
5. **Restart Chrome completely**
6. **Reload extension**
7. **Try sign-in**

## Most Likely Issue

**Extension ID mismatch:**
- Chrome Extension ID: `jjpbalnpbnmhbliggpoemmdceikojpld`
- OAuth Client Item ID: `________________` (check this!)

**They must match EXACTLY:**
- Same 32 characters
- Same case (all lowercase)
- No spaces
- No extra characters

## Quick Verification

**Copy both and compare:**

1. Extension ID from `chrome://extensions/`: 
   ```
   jjpbalnpbnmhbliggpoemmdceikojpld
   ```

2. Item ID from Google Cloud Console OAuth client:
   ```
   ________________
   ```

**Do they match character by character?**

---

**Check the Item ID in your OAuth client - it must match the Extension ID exactly!**
