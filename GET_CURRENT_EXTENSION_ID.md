# 🔍 Get Your Current Extension ID

## Step 1: Find Extension ID

1. Go to: `chrome://extensions/`
2. Find **"test2"** extension
3. Look for the **ID** below the extension name (it's a long string like `jjpbalnpbnmhbliggpoemmdceikojpld`)
4. **Copy that ID** - you'll need it for the OAuth client

## Step 2: Create OAuth Client for This ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Chrome Extension"** as the application type
4. **Item ID:** Paste the Extension ID from Step 1
5. Click **"CREATE"**
6. **Copy the Client ID** that's generated

## Step 3: Update manifest.json

Once you have the new Client ID, I'll update your manifest.json with it.

---

**The extension is working - we just need to fix the OAuth client configuration!**
