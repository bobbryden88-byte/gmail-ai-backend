# 🔧 Fix: Unpacked Extension ID Changes Every Time

## The Root Cause

**Unpacked extensions get a NEW Extension ID every time you load them**, unless you add a `"key"` field to `manifest.json`.

This is why:
- OAuth client is configured for: `jjpbalnpbnmhbliggpoemmdceikojpld`
- But Chrome gives extension a different ID each time
- Chrome can't find the OAuth client
- No OAuth traffic (request never reaches Google)

## Solution: Add "key" to manifest.json

### Step 1: Get Extension Key from Chrome Web Store

Since your extension is published:

1. **Install extension from Chrome Web Store** (the live version)
2. Go to: `chrome://extensions/`
3. Find the **live extension** (from Chrome Web Store)
4. Click **"Details"**
5. Look for extension directory path
6. Or: Find extension folder on your computer:
   - **Mac:** `~/Library/Application Support/Google/Chrome/Default/Extensions/[EXTENSION_ID]/[VERSION]/`
   - **Windows:** `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\[EXTENSION_ID]\[VERSION]\`
7. Open `manifest.json` in that folder
8. **Copy the "key" value** (long string)

### Step 2: Add Key to Your manifest.json

1. Open: `/Users/bobbryden/gmail-ai-assistant/manifest.json`
2. Add `"key"` field at the top level:
   ```json
   {
     "manifest_version": 3,
     "name": "Inkwell - Gmail AI Assistant",
     "key": "YOUR_KEY_FROM_CHROME_WEB_STORE_MANIFEST",
     ...
   }
   ```
3. Save

### Step 3: Reload Extension

1. Go to: `chrome://extensions/`
2. **Remove** the testing extension
3. **Load unpacked** again
4. **Check Extension ID** - should now be consistent!
5. **Should match:** `jjpbalnpbnmhbliggpoemmdceikojpld` (or your live Extension ID)

### Step 4: Test OAuth

1. Reload extension
2. Try Google sign-in
3. Should work! ✅
4. Check OAuth traffic in Google Cloud Console - should see requests now!

## Alternative: Use Live Extension for Testing

If you can't get the key:

1. **Test with live extension** (from Chrome Web Store)
2. **Create OAuth client for live Extension ID:** `oicpmfbmankanehinmchmbakcjmlmodc`
3. **Test Google sign-in on live extension**
4. Should work immediately

## Why This Happens

- **Unpacked extensions:** Get random Extension ID each time
- **Published extensions:** Keep same Extension ID (from "key" field)
- **OAuth client:** Needs consistent Extension ID to match

## Quick Fix

**Add "key" field to manifest.json** - this will make the Extension ID consistent, and OAuth will work!

---

**The "key" field is the missing piece! Add it to manifest.json and OAuth will work.**
