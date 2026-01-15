# 🔍 Still Getting "Bad Client ID" - Debug Steps

## The Error

`'bad client id: {0}'` means Chrome is trying to use an OAuth client but can't find it or it's misconfigured.

## Step 1: Verify Extension ID After Adding Key

After adding the "key" to manifest.json, the Extension ID should be consistent. Let's verify:

1. Go to: `chrome://extensions/`
2. Find your extension (testing or live)
3. **What Extension ID does it show now?**
   - Is it `oicpmfbmankanehinmchmbakcjmlmodc`? (live)
   - Or something else?

## Step 2: Verify OAuth Client Configuration

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find your OAuth client
4. **Check:**
   - **Type:** Should be "Chrome Extension" ✅
   - **Item ID:** Should match your Extension ID exactly ✅
   - **Status:** Should be Active ✅

## Step 3: Check Which Extension You're Testing

**Are you testing with:**
- **Testing extension** (unpacked, with key added)?
- **Live extension** (from Chrome Web Store)?

**Make sure:**
- If testing with **testing extension** → OAuth client Item ID should be `jjpbalnpbnmhbliggpoemmdceikojpld`
- If testing with **live extension** → OAuth client Item ID should be `oicpmfbmankanehinmchmbakcjmlmodc`

## Step 4: Complete Chrome Restart

1. **Close ALL Chrome windows** (completely exit)
2. **Wait 1 minute**
3. **Reopen Chrome**
4. **Go to:** `chrome://extensions/`
5. **Remove extension** (if testing version)
6. **Load unpacked** again (if testing)
7. **Or reload** live extension
8. **Check Extension ID** - note it down
9. **Try sign-in**

## Step 5: Verify OAuth Client Item ID Matches

**Critical check:**
1. **Extension ID from `chrome://extensions/`:** `________________`
2. **Item ID in OAuth client:** `________________`
3. **Do they match exactly?** Yes / No

If they don't match:
- Update OAuth client Item ID to match Extension ID exactly
- Wait 5 minutes
- Try again

## Step 6: Check OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. **Is it configured?**
   - User Type: External
   - App name: Something
   - Your email
3. **Publishing status:** Testing or In production?

If not configured or in "Testing" mode:
- Configure it properly
- Or publish to production

## Most Likely Issues

### Issue 1: Extension ID Mismatch
- Extension ID after adding key doesn't match OAuth client Item ID
- **Fix:** Update OAuth client Item ID to match Extension ID exactly

### Issue 2: Testing Wrong Extension
- Testing with testing extension but OAuth client is for live Extension ID (or vice versa)
- **Fix:** Make sure OAuth client Item ID matches the Extension ID you're testing with

### Issue 3: Chrome Cache
- Chrome still using old Extension ID or OAuth client
- **Fix:** Complete Chrome restart, remove and reload extension

## Quick Check

**Answer these:**
1. **Which extension are you testing?** (testing unpacked / live from store)
2. **What Extension ID does it show?** (from `chrome://extensions/`)
3. **What Item ID is in your OAuth client?** (from Google Cloud Console)
4. **Do they match exactly?** Yes / No

---

**Check the Extension ID first - it might have changed after adding the key!**
