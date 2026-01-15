# ✅ Delete and Recreate OAuth Client

## Yes, Delete and Create New One

Since you can't change "Chrome Extension" to "Chrome App", delete the old one and create a new one.

## Step-by-Step Instructions

### Step 1: Get Your Extension ID First

**Important:** Get this BEFORE deleting, so you have it ready:

1. Open: `chrome://extensions/`
2. Enable Developer mode
3. Find "Inkwell - Gmail AI Assistant"
4. **Copy the Extension ID** (32 characters)
   - Example: `abcdefghijklmnopqrstuvwxyz123456`
   - **Save this somewhere** - you'll need it in Step 3

### Step 2: Delete Old OAuth Client

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Find: "Inkwell Gmail AI Assistant Extension"
4. Click the **trash icon** (or three dots → Delete)
5. Confirm deletion

### Step 3: Create New OAuth Client

1. Still in **Credentials** page
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If you see "OAuth consent screen" warning:
   - Click **"Configure Consent Screen"**
   - User Type: **External**
   - App name: **Inkwell**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
   - Return to Credentials

4. Now create the OAuth client:
   - **Application type:** Select **"Chrome App"** ⚠️ (NOT "Chrome Extension")
   - **Application ID:** Paste your Extension ID (from Step 1)
   - Click **"Create"**

5. **Note the Client ID** (you don't need to use it in code, Chrome handles it)

### Step 4: Verify

The new OAuth client should show:
- ✅ **Type:** Chrome App
- ✅ **Application ID:** Your Extension ID (matches exactly)
- ✅ **Client ID:** (some long string - this is fine)

### Step 5: Test

1. **Wait 1-2 minutes** (Google needs time to propagate)
2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on your extension
3. **Test Google sign-in:**
   - Open Gmail
   - Click extension icon
   - Click "Sign in with Google"
   - Should work now! ✅

## Important Notes

- ✅ **Safe to delete** - The old OAuth client won't work anyway
- ✅ **No code changes needed** - Chrome automatically uses the new client
- ✅ **Extension will work immediately** after you create the new client
- ⚠️ **Make sure type is "Chrome App"** (not "Chrome Extension")

## If You Make a Mistake

If you accidentally create the wrong type:
- Just delete it and create again
- No harm done
- Extension will keep working

---

**After creating the new "Chrome App" OAuth client, Google sign-in will work!**
