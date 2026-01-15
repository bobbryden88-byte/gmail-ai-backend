# 🧪 Testing vs Live Extension - OAuth Configuration

## Important Question: Do They Have Different Extension IDs?

### Scenario 1: Same Extension ID (Unpacked + Store Version)
- **Testing version:** Unpacked extension loaded from `chrome://extensions/`
- **Live version:** Extension installed from Chrome Web Store
- **Extension ID:** **SAME** for both ✅
- **OAuth Client:** **ONE** OAuth client works for both ✅

### Scenario 2: Different Extension IDs
- **Testing version:** Different Extension ID (e.g., unpacked with different key)
- **Live version:** Different Extension ID (Chrome Web Store)
- **Extension IDs:** **DIFFERENT** ❌
- **OAuth Client:** Need **TWO** OAuth clients (one for each Extension ID) ⚠️

## How to Check

### Check Testing Extension ID:
1. Go to: `chrome://extensions/`
2. Enable Developer mode
3. Find your **testing/unpacked** extension
4. **Copy Extension ID**

### Check Live Extension ID:
1. Go to: `chrome://extensions/`
2. Find your **live/store** extension
3. **Copy Extension ID**

### Compare:
- **Same?** → One OAuth client works for both ✅
- **Different?** → Need separate OAuth clients ⚠️

## Recommendation

### Option 1: Test on Testing Version First (Safer)

**Pros:**
- ✅ Won't affect live users
- ✅ Can test without risk
- ✅ Easy to iterate

**Steps:**
1. Get testing Extension ID
2. Create/update OAuth client with testing Extension ID
3. Test Google sign-in on testing version
4. If it works, apply same fix to live version

### Option 2: Apply Directly to Live Version

**Pros:**
- ✅ Fixes issue for all users immediately
- ✅ No separate testing needed

**Cons:**
- ⚠️ If something breaks, affects all users
- ⚠️ Harder to test first

## Best Practice: Test First, Then Deploy

### Step 1: Test on Testing Version
1. Get testing Extension ID
2. Create OAuth client with testing Extension ID
3. Test Google sign-in
4. Verify it works

### Step 2: Apply to Live Version
1. Get live Extension ID
2. If same as testing → OAuth client already works!
3. If different → Create second OAuth client with live Extension ID
4. Test on live version

## If Extension IDs Are Different

You'll need **TWO** OAuth clients:

**OAuth Client 1:**
- Name: "Inkwell - Testing"
- Type: Chrome Extension
- Application ID: Testing Extension ID

**OAuth Client 2:**
- Name: "Inkwell - Live"
- Type: Chrome Extension
- Application ID: Live Extension ID

## Quick Check

**Answer these:**
1. Do testing and live extensions have the **same Extension ID**?
   - Yes → One OAuth client works for both ✅
   - No → Need two OAuth clients ⚠️

2. Which Extension ID is currently in your OAuth client?
   - Check in Google Cloud Console
   - Does it match testing or live?

## Recommendation

**Test on testing version first:**
1. ✅ Safer - won't break live version
2. ✅ Can verify fix works
3. ✅ Then apply to live with confidence

**After testing works:**
- If Extension IDs are same → Already fixed! ✅
- If Extension IDs are different → Create second OAuth client for live version

---

**Check your Extension IDs first, then decide!**
