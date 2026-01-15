# ✅ OAuth Client Type Selection

## What to Select

**Select: "Chrome Extension"**

Even though `chrome.identity.getAuthToken()` historically used "Chrome App", Google may have updated their console. "Chrome Extension" should work.

## Complete Setup Steps

### 1. Select Application Type
- **Choose: "Chrome Extension"**

### 2. Fill in Application ID
- **Application ID:** Paste your Extension ID (32 characters)
  - Get it from: `chrome://extensions/` → Enable Developer mode → Copy Extension ID

### 3. Create
- Click **"Create"**

## Important: Application ID Must Match

The critical part is that the **Application ID** field must match your Extension ID exactly:
- ✅ 32 characters
- ✅ No spaces
- ✅ Exact match from `chrome://extensions/`

## After Creating

1. **Wait 1-2 minutes** for Google to propagate
2. **Reload extension:** `chrome://extensions/` → reload
3. **Test Google sign-in**

## If It Still Doesn't Work

If "Chrome Extension" type still gives errors, the issue might be:
1. Application ID doesn't match Extension ID exactly
2. Need to wait longer for propagation
3. Try clearing Chrome cache and reloading extension

---

**Select "Chrome Extension" and make sure Application ID matches your Extension ID exactly!**
