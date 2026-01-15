# 🔧 Fix Chrome Extension OAuth "Bad Client ID" Error

## The Problem

The error `"bad client id: 999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com"` happens because:

1. `chrome.identity.getAuthToken()` requires an OAuth client configured in Google Cloud Console
2. The OAuth client must be set up as a **Chrome App** type
3. Your **Chrome Extension ID** must be authorized in that OAuth client

## Solution: Configure OAuth Client in Google Cloud Console

### Step 1: Get Your Chrome Extension ID

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Find **"Inkwell - Gmail AI Assistant"**
5. Copy the **Extension ID** (32 characters, looks like: `abcdefghijklmnopqrstuvwxyz123456`)

### Step 2: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Go to: **APIs & Services** → **Credentials**

### Step 3: Create or Update OAuth Client

**Option A: Create New OAuth Client (Recommended)**

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. If prompted, configure OAuth consent screen first:
   - User Type: **External** (unless you have a Google Workspace)
   - App name: **Inkwell - Gmail AI Assistant**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Click **Save and Continue** (no scopes needed for Chrome extension)
   - Test users: Click **Save and Continue**
   - Summary: Click **Back to Dashboard**

3. Now create OAuth client:
   - Application type: **Chrome App**
   - Application ID: **Paste your Extension ID** (from Step 1)
   - Click **Create**

4. **Copy the Client ID** that's generated (it will be different from the one in the error)

**Option B: Update Existing OAuth Client**

1. Find the OAuth client: `999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com`
2. Click **Edit**
3. Change Application type to **Chrome App**
4. Add your **Extension ID** as the Application ID
5. Click **Save**

### Step 4: Verify Configuration

The OAuth client should show:
- **Type:** Chrome App
- **Application ID:** Your Extension ID
- **Client ID:** (will be shown, note it down)

## Important Notes

1. **The Client ID in the error might be wrong** - Create a new one as Chrome App type
2. **Extension ID must match exactly** - Copy it from `chrome://extensions/`
3. **No backend changes needed** - This is purely a Google Cloud Console configuration
4. **Users need to reload extension** after you fix this

## After Configuration

1. The OAuth client will be configured correctly
2. `chrome.identity.getAuthToken()` will work
3. Google sign-in will function properly
4. No extension update needed (v1.1 will work once OAuth is configured)

## If You Can't Access Google Cloud Console

If you don't have access to Google Cloud Console:
1. You'll need to create a Google Cloud project
2. Enable Google+ API (if still required) or Google Identity API
3. Create the OAuth client as described above

---

**This is the root cause** - The OAuth client needs to be properly configured in Google Cloud Console for Chrome extensions.
