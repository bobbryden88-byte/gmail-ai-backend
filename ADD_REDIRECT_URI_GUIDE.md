# 🔧 How to Add Redirect URI to OAuth Client

## Current Status

✅ **OAuth Client Created:** "Inkwell Gmail AI Assistant Extension"  
✅ **Client ID:** `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`  
✅ **Extension ID:** `jjpbalnpbnmhbliggpoemmdceikojpld`

## Step-by-Step: Add Redirect URI

### On the OAuth Client Details Page:

1. **Scroll down** on the page you're currently viewing
2. Look for the section: **"Authorized redirect URIs"**
3. Click **"+ ADD URI"** button
4. Enter this exact URI:
   ```
   https://jjpbalnpbnmhbliggpoemmdceikojpld.chromiumapp.org/
   ```
5. Click **"SAVE"** at the bottom of the page

### If You Don't See "Authorized redirect URIs" Section:

For Chrome Extension type OAuth clients, Google may auto-handle redirects, but you should still see the section. If not:

1. Try clicking **"EDIT"** button (if visible)
2. Or look for **"Application type"** - it should say "Chrome Extension"
3. The redirect URI format for Chrome extensions is: `https://{EXTENSION_ID}.chromiumapp.org/`

## ✅ What to Enter

**Redirect URI:**
```
https://jjpbalnpbnmhbliggpoemmdceikojpld.chromiumapp.org/
```

**Important:** 
- Include the `https://` prefix
- Include the trailing `/`
- Use your Extension ID: `jjpbalnpbnmhbliggpoemmdceikojpld`

## After Adding the URI

Once you've added and saved the redirect URI, let me know and I'll proceed with:
1. ✅ Phase 2: Database Schema Updates
2. ✅ Phase 3: Backend Implementation
3. ✅ Phase 4: Extension Updates

---

**Note:** The Item ID shown (`oicpmfbmankanehinmchmbakcjmlmodc`) is your Chrome Web Store ID, which is different from the Extension ID. For OAuth redirect URIs, we use the Extension ID from `chrome://extensions/`.
