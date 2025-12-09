# 🚀 Phase 1: Google Cloud Console - Quick Start

## You're Here: Google Cloud Console Dashboard

**Current Project:**
- Name: My First Project
- ID: project-022d68de-34ab-42c2-b22

## Quick Navigation Steps

### 1. Enable People API (2 minutes)

**Click:** Hamburger menu (☰) → **"APIs & Services"** → **"Library"**

**Search:** `People API`

**Click:** "People API" → **"Enable"**

### 2. Configure OAuth Consent Screen (5 minutes)

**Click:** Hamburger menu (☰) → **"APIs & Services"** → **"OAuth consent screen"**

**Select:** External → **"Create"**

**Fill in:**
- App name: `Inkwell - Gmail AI Assistant`
- User support email: (your email)
- Developer contact: (your email)

**Add Scopes:**
- Click "Add or Remove Scopes"
- Add: `.../auth/userinfo.email`
- Add: `.../auth/userinfo.profile`
- Save

**Add Test User:**
- Add your email address
- Save and Continue

### 3. Create OAuth Credentials (3 minutes)

**Click:** Hamburger menu (☰) → **"APIs & Services"** → **"Credentials"**

**Click:** "+ CREATE CREDENTIALS" → "OAuth client ID"

**Select:** Chrome App

**Name:** `Inkwell Gmail AI Assistant Extension`

**Application ID:** (leave blank for now)

**Click:** Create

**Copy the Client ID** - Save it somewhere!

### 4. Get Extension ID (1 minute)

1. Open Chrome → `chrome://extensions/`
2. Enable Developer mode
3. Find "Inkwell - Gmail AI Assistant"
4. Copy the Extension ID

### 5. Update OAuth Credentials (2 minutes)

1. Go back to Credentials in Google Cloud
2. Click on your OAuth client ID
3. Under "Authorized redirect URIs" → "+ ADD URI"
4. Add: `https://YOUR_EXTENSION_ID.chromiumapp.org/`
5. Save

## ✅ What You'll Have

- **Client ID:** `xxxxx.apps.googleusercontent.com`
- **Extension ID:** `abcdefgh...`
- **OAuth Consent Screen:** Configured
- **Redirect URI:** Added

## 📝 Save These Values

**Client ID:** _________________________

**Extension ID:** _________________________

---

**Once you have both IDs, let me know and I'll help you add them to your code!**
