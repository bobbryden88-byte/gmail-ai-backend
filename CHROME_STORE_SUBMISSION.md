# 🚀 Chrome Web Store Submission Guide

## Pre-Submission Checklist

### 1. **Update Version Number**
- Open `manifest.json` in your extension directory
- Increment the `version` field (e.g., `"version": "1.0.0"` → `"version": "1.0.1"`)

### 2. **Verify Manifest.json**
Ensure your `manifest.json` includes:
- ✅ `manifest_version: 3`
- ✅ `name` and `description`
- ✅ `version`
- ✅ `icons` (at least 128x128 and 48x48)
- ✅ `permissions` (only what's needed)
- ✅ `host_permissions` (only `*://mail.google.com/*` and your backend URL)
- ✅ `action.default_popup`
- ✅ `background.service_worker`

### 3. **Remove Debug Code**
- Remove or comment out `console.log()` statements
- Remove debug endpoints (like `/api/ai/debug-key`)
- Remove any test/development code

### 4. **Prepare Assets**

#### Icons Required:
- **16x16** - Toolbar icon
- **48x48** - Extension management page
- **128x128** - Chrome Web Store listing

#### Screenshots (Optional but Recommended):
- 1280x800 or 640x400
- Show the extension in action on Gmail
- Highlight key features

### 5. **Privacy Policy**
- Create a `privacy-policy.html` file
- Include:
  - What data is collected
  - How data is used
  - Data storage (backend server)
  - Third-party services (OpenAI)
  - User rights

### 6. **Update Backend URL**
- Ensure `manifest.json` uses production backend URL:
  ```json
  "host_permissions": [
    "*://mail.google.com/*",
    "https://gmail-ai-backend.vercel.app/*"
  ]
  ```

## Submission Steps

### Step 1: Create ZIP Package
```bash
cd /path/to/gmail-ai-assistant
zip -r gmail-ai-assistant-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "*.md" \
  -x ".env*"
```

### Step 2: Go to Chrome Web Store Developer Dashboard
1. Visit: https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Click **"New Item"**

### Step 3: Upload Your Extension
1. Upload the ZIP file
2. Fill in store listing details:
   - **Name**: Gmail AI Assistant
   - **Summary**: Brief description (132 characters max)
   - **Description**: Full feature description
   - **Category**: Productivity
   - **Language**: English

### Step 4: Upload Assets
- Upload icons (16x16, 48x48, 128x128)
- Upload screenshots (optional)
- Upload promotional images (optional)

### Step 5: Privacy & Permissions
- **Privacy Policy URL**: Link to your privacy policy
- **Single Purpose**: Explain why you need Gmail access
- **Permission Justification**: 
  - `mail.google.com` - To inject AI assistant UI into Gmail
  - `storage` - To save authentication tokens
  - Backend URL - To communicate with AI service

### Step 6: Distribution
- **Visibility**: Public (or Unlisted for testing)
- **Regions**: All regions (or specific ones)
- **Pricing**: Free

### Step 7: Submit for Review
- Click **"Submit for Review"**
- Review typically takes 1-3 business days
- You'll receive email notifications about status

## Common Rejection Reasons

1. **Missing Privacy Policy** - Required for extensions that handle user data
2. **Vague Permission Justification** - Be specific about why you need Gmail access
3. **Incomplete Manifest** - Missing required fields
4. **Broken Functionality** - Extension doesn't work as described
5. **Policy Violations** - Review Chrome Web Store policies

## Post-Submission

### Monitor Reviews
- Check developer dashboard for review status
- Respond to any reviewer questions promptly

### Update Process
- For updates, upload new ZIP with incremented version
- Changes go through review again (usually faster)

## Quick Commands

```bash
# Create submission package
cd /Users/bobbryden/gmail-ai-assistant
zip -r ../gmail-ai-assistant-v1.0.0.zip . \
  -x "*.git*" -x "*.DS_Store" -x "node_modules/*" \
  -x "*.md" -x ".env*" -x ".vscode/*"

# Verify ZIP contents
unzip -l gmail-ai-assistant-v1.0.0.zip
```

---

**Need help?** Check Chrome Web Store documentation:
https://developer.chrome.com/docs/webstore/publish/
