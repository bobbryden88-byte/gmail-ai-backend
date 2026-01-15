# 🔧 Create OAuth Client for Testing Extension

## The Issue

- **Testing Extension ID:** `jjpbalnpbnmhbliggpoemmdceikojpld`
- **Live Extension ID:** `oicpmfbmankanehinmchmbakcjmlmodc`
- **Current OAuth client:** Configured for live Extension ID
- **Testing extension won't work** with live OAuth client

## Solution: Create OAuth Client for Testing Extension

### Step 1: Create New OAuth Client

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. **Application type:** Chrome Extension
5. **Item ID:** `jjpbalnpbnmhbliggpoemmdceikojpld` (testing Extension ID)
6. **Name:** "Inkwell - Testing"
7. Click **"Create"**
8. **Copy the Client ID** (will be different from live one)

### Step 2: Update manifest.json with Testing Client ID

Once you have the testing OAuth client ID, I'll update manifest.json with it.

---

**Create the OAuth client for testing Extension ID first, then share the Client ID and I'll update the manifest.**
