# ✅ Verify Client ID Match

## Current Configuration

**Google Cloud Console:**
- Type: Chrome Extension ✅
- Client ID: `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`

**Extension manifest.json:**
- Should have same Client ID

## Verification Steps

### Step 1: Check manifest.json
The Client ID in `manifest.json` must match **exactly** (no spaces, no typos).

### Step 2: Reload Extension
After any changes:
1. Go to `chrome://extensions/`
2. **Reload** "Inkwell - Gmail AI Assistant"
3. Wait 10 seconds
4. Test again

### Step 3: Check for Caching
Google can cache OAuth settings. Try:
1. Wait 5-10 minutes
2. Test again
3. Or try in incognito mode

## If Still Not Working

### Option 1: Edit Item ID
If you can edit the OAuth client:
- Change Item ID from `oicpmfbmankanehinmchmbakcjmlmodc` to `jjpbalnpbnmhbliggpoemmdceikojpld`
- Or leave it empty

### Option 2: Create New OAuth Client
1. Create new "Chrome Extension" type client
2. Item ID: `jjpbalnpbnmhbliggpoemmdceikojpld` (or empty)
3. Use new Client ID in manifest.json

## Debugging

Check browser console for:
- Exact error message
- Any additional details about the Client ID

Check background script console:
- Go to `chrome://extensions/`
- Click "Inspect views: service worker"
- Look for errors when clicking "Sign in with Google"

---

**Next:** Verify manifest.json has the exact Client ID, then reload extension and test again.
