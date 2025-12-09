# 🔴 OAuth Client ID Error - "bad client id"

## Error Message
```
OAuth2 request failed: Service responded with error: 'bad client id: 999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com'
```

## Root Cause
The Client ID is being rejected by Google's OAuth service. This usually means:
1. **OAuth client type is wrong** - Should be "Chrome Extension", not "Web Application"
2. **Client ID mismatch** - Manifest.json has different ID than Google Cloud Console
3. **OAuth client not properly configured** - Missing required settings

## Fix Steps

### Step 1: Verify OAuth Client Type in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID: `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5`
4. **Click on it** to open details
5. **Check the "Application type"** - It MUST say **"Chrome Extension"**
6. If it says "Web Application", that's the problem!

### Step 2: If Application Type is Wrong

**Option A: Delete and Recreate (Recommended)**
1. Delete the existing OAuth client
2. Create a new one:
   - **Application type:** Chrome Extension
   - **Name:** Inkwell Gmail AI Assistant Extension
   - **Item ID:** Leave empty (or use Extension ID if you have it)
3. Copy the new Client ID
4. Update manifest.json with new Client ID

**Option B: Keep Existing Client (If it's Chrome Extension type)**
- Verify the Client ID in manifest.json matches exactly
- Check for any typos or extra spaces

### Step 3: Verify Manifest.json

Check that `manifest.json` has:
```json
{
  "oauth2": {
    "client_id": "999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  }
}
```

### Step 4: Common Issues

#### Issue 1: Client ID has extra spaces or characters
- Check for leading/trailing spaces
- Check for line breaks
- Should be exactly: `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`

#### Issue 2: OAuth Client is "Web Application" type
- Chrome extensions MUST use "Chrome Extension" type
- Web Application type won't work with `chrome.identity.getAuthToken()`

#### Issue 3: Client ID doesn't exist
- Verify it exists in Google Cloud Console
- Check you're in the correct Google Cloud project

## Quick Verification

Run this in browser console on Gmail page:
```javascript
// Check manifest oauth2 config
chrome.runtime.getManifest().oauth2
```

Should show:
```javascript
{
  client_id: "999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com",
  scopes: [...]
}
```

## Next Steps

1. **Check Google Cloud Console** - Verify OAuth client type is "Chrome Extension"
2. **Verify Client ID** - Make sure it matches exactly in manifest.json
3. **Reload Extension** - After any changes
4. **Test Again** - Click "Sign in with Google" button

---

**Most likely fix:** The OAuth client in Google Cloud Console is set to "Web Application" instead of "Chrome Extension". Change it or create a new Chrome Extension type client.
