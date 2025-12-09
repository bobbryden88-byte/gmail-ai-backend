# 🔧 Fix OAuth Client ID Error

## Error
```
OAuth2 request failed: Service responded with error: 'bad client id'
```

## Root Cause
The OAuth client in Google Cloud Console is likely set to **"Web Application"** instead of **"Chrome Extension"**.

Chrome extensions using `chrome.identity.getAuthToken()` **MUST** use a "Chrome Extension" type OAuth client.

## Solution: Create New Chrome Extension OAuth Client

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Create New OAuth Client
1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. **Application type:** Select **"Chrome Extension"** ⚠️ (NOT Web Application!)
4. **Name:** "Inkwell Gmail AI Assistant Extension"
5. **Item ID:** Leave empty (or enter: `jjpbalnpbnmhbliggpoemmdceikojpld`)
6. Click **"CREATE"**

### Step 3: Copy New Client ID
- You'll see a popup with the new Client ID
- Copy it (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### Step 4: Update Extension Files

**Update `manifest.json`:**
```json
"oauth2": {
  "client_id": "YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

**Update backend `.env`:**
```
GOOGLE_CLIENT_ID="YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com"
```

**Update Vercel environment variable:**
- Go to Vercel dashboard
- Project → Settings → Environment Variables
- Update `GOOGLE_CLIENT_ID` with new value

### Step 5: Reload Extension
1. Go to `chrome://extensions/`
2. Reload "Inkwell - Gmail AI Assistant"
3. Test Google sign-in again

## Why This Happens

- **Web Application** OAuth clients are for web apps (redirect URIs, etc.)
- **Chrome Extension** OAuth clients are for extensions (uses `chrome.identity.getAuthToken()`)
- They're different types and not interchangeable

## Verification

After creating the new client, verify:
- ✅ Application type: **Chrome Extension**
- ✅ Client ID matches in manifest.json
- ✅ Extension reloaded
- ✅ Test sign-in again

---

**Once you have the new Client ID, share it and I'll update all the files!**
