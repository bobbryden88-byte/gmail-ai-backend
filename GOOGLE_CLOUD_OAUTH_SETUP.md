# 🔐 Google Cloud Console - OAuth Setup Guide

## Current Status
- ✅ Logged in as: bob bryden
- ✅ Project: My First Project
- ✅ Project Number: 999965368356
- ✅ Project ID: project-022d68de-34ab-42c2-b22

## Step-by-Step OAuth Setup

### Step 1: Enable Required APIs

1. In the Google Cloud Console, click the **hamburger menu** (☰) in the top left
2. Go to **"APIs & Services"** → **"Library"**
3. Search for and enable:
   - **"Google+ API"** (or "People API")
   - Click "Enable"

### Step 2: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**

**Fill in the form:**

**App Information:**
- App name: `Inkwell - Gmail AI Assistant`
- User support email: `your-email@example.com` (your email)
- App logo: (optional - can skip for now)
- App domain: (optional - can skip)
- Application home page: (optional - can skip)
- Privacy policy link: (optional for testing, required for production)
- Terms of service link: (optional)

**Developer contact information:**
- Email addresses: `your-email@example.com`

4. Click **"Save and Continue"**

**Scopes:**
5. Click **"Add or Remove Scopes"**
6. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Click **"Update"** then **"Save and Continue"**

**Test users:**
8. Add your email address as a test user (for testing phase)
9. Click **"Save and Continue"**

10. Review and click **"Back to Dashboard"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

**Application type:**
4. Select **"Chrome App"**

**Name:**
5. Enter: `Inkwell Gmail AI Assistant Extension`

**Application ID:**
6. **LEAVE THIS BLANK FOR NOW** - We'll add it after getting Extension ID

7. Click **"Create"**

8. **Copy the Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
9. **Save this Client ID** - you'll need it!

10. Click **"OK"**

### Step 4: Get Your Extension ID

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Find **"Inkwell - Gmail AI Assistant"**
5. **Copy the Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

### Step 5: Update OAuth Credentials with Extension ID

1. Go back to Google Cloud Console
2. **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth client ID (the one you just created)
4. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
5. Add: `https://YOUR_EXTENSION_ID.chromiumapp.org/`
   - Replace `YOUR_EXTENSION_ID` with the actual ID from Step 4
6. Click **"Save"**

### Step 6: Save Your Credentials

**You'll need these values:**

1. **Client ID:** `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - Save to: Backend `.env` file as `GOOGLE_CLIENT_ID`
   - Save to: Extension `manifest.json` in `oauth2.client_id`

2. **Extension ID:** `abcdefghijklmnopqrstuvwxyz123456`
   - Already used in redirect URI

## ✅ Checklist

- [ ] Google+ API (or People API) enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created (Chrome App type)
- [ ] Extension ID obtained
- [ ] Redirect URI added to OAuth credentials
- [ ] Client ID saved for use in code

## 🎯 Next Steps

Once you have the Client ID:
1. We'll add it to your backend `.env` file
2. We'll add it to your extension `manifest.json`
3. Then proceed to Phase 2 (Database changes)

---

**Need help?** Let me know when you've completed these steps and I'll help you with the next phase!
