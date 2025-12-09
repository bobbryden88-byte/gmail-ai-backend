# 📋 Phase 1: Step-by-Step with Screenshots Guide

## Step 1: Enable People API ✅

**You're seeing the search results - here's what to do:**

1. **Click on the FIRST result:** "Google People API" (the one that says "Google Enterprise API")
   - Description: "Provides access to information about profiles and contacts."

2. **On the next page, click the blue "ENABLE" button**

3. **Wait for it to enable** (takes a few seconds)

4. **You should see:** "API enabled" confirmation

✅ **Step 1 Complete!**

---

## Step 2: Configure OAuth Consent Screen

### 2.1: Navigate to OAuth Consent Screen

1. Click the **hamburger menu (☰)** in the top left
2. Go to **"APIs & Services"**
3. Click **"OAuth consent screen"** (in the left sidebar)

### 2.2: Create Consent Screen

1. You'll see a page asking to configure the consent screen
2. Select **"External"** (unless you have Google Workspace)
3. Click **"CREATE"**

### 2.3: Fill in App Information

**App Information tab:**
- **App name:** `Inkwell - Gmail AI Assistant`
- **User support email:** Select your email from dropdown
- **App logo:** (Skip for now - optional)
- **Application home page:** (Skip - optional)
- **Privacy policy link:** (Skip for testing, add later for production)
- **Terms of service link:** (Skip - optional)

**Developer contact information:**
- **Email addresses:** Your email (should auto-fill)

4. Click **"SAVE AND CONTINUE"** (bottom right)

### 2.4: Add Scopes

1. You'll see the "Scopes" page
2. Click **"ADD OR REMOVE SCOPES"** button
3. In the filter/search box, type: `userinfo.email`
4. Check the box for: `.../auth/userinfo.email`
5. In the filter/search box, type: `userinfo.profile`
6. Check the box for: `.../auth/userinfo.profile`
7. Click **"UPDATE"** (bottom right)
8. Click **"SAVE AND CONTINUE"**

### 2.5: Add Test Users

1. You'll see the "Test users" page
2. Click **"+ ADD USERS"**
3. Enter your email address
4. Click **"ADD"**
5. Click **"SAVE AND CONTINUE"**

### 2.6: Review

1. Review the summary
2. Click **"BACK TO DASHBOARD"**

✅ **Step 2 Complete!**

---

## Step 3: Create OAuth 2.0 Credentials

### 3.1: Navigate to Credentials

1. Still in **"APIs & Services"**
2. Click **"Credentials"** (in the left sidebar)

### 3.2: Create OAuth Client ID

1. Click the **"+ CREATE CREDENTIALS"** button (top of page)
2. Select **"OAuth client ID"** from the dropdown

### 3.3: Configure OAuth Client

**If asked about consent screen:**
- Click **"CONFIGURE CONSENT SCREEN"** if you haven't completed Step 2
- Or select your app and click **"CREATE"**

**Application type:**
- Select **"Chrome App"**

**Name:**
- Enter: `Inkwell Gmail AI Assistant Extension`

**Application ID:**
- **LEAVE THIS BLANK** (we'll add Extension ID later)

**Click:** **"CREATE"**

### 3.4: Save Client ID

1. A popup will appear with your **Client ID**
2. **COPY THE CLIENT ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
3. **SAVE IT SOMEWHERE** - you'll need it!
4. Click **"OK"**

✅ **Step 3 Complete!** (You now have Client ID)

---

## Step 4: Get Your Extension ID

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top right corner)
4. Find **"Inkwell - Gmail AI Assistant"** in the list
5. Look for **"ID:"** under the extension name
6. **COPY THE EXTENSION ID** (long string like: `abcdefghijklmnopqrstuvwxyz123456`)

✅ **Step 4 Complete!** (You now have Extension ID)

---

## Step 5: Update OAuth Credentials with Extension ID

### 5.1: Edit OAuth Client

1. Go back to Google Cloud Console
2. **"APIs & Services"** → **"Credentials"**
3. Find your OAuth 2.0 Client ID (the one you just created)
4. **Click on it** (the name, not the edit icon)

### 5.2: Add Redirect URI

1. Scroll down to **"Authorized redirect URIs"**
2. Click **"+ ADD URI"**
3. Enter: `https://YOUR_EXTENSION_ID.chromiumapp.org/`
   - Replace `YOUR_EXTENSION_ID` with the actual Extension ID from Step 4
   - Example: `https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/`
4. Click **"SAVE"** (top right)

✅ **Step 5 Complete!**

---

## ✅ Phase 1 Checklist

- [ ] People API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created (Chrome App type)
- [ ] Client ID copied and saved
- [ ] Extension ID obtained
- [ ] Redirect URI added to OAuth credentials

---

## 📝 What You Should Have Now

**Client ID:** `_________________________.apps.googleusercontent.com`

**Extension ID:** `________________________________`

---

## 🎯 Next: Share Your IDs

Once you have both IDs, share them with me and I'll:
1. Add Client ID to your backend `.env` file
2. Add Client ID to your extension `manifest.json`
3. Proceed to Phase 2 (Database changes)

**Ready to continue?** Let me know when you have both IDs!
