# ✅ Chrome Web Store Submission Checklist

## Pre-Submission Tasks

### ✅ Backend
- [x] API key issue resolved (using Vercel CLI)
- [ ] Remove debug endpoint `/api/ai/debug-key` (DONE - commented out)
- [x] Production backend URL: `https://gmail-ai-backend.vercel.app`
- [x] All environment variables set correctly in Vercel

### 📦 Extension Package

#### Manifest.json
- [x] Version: `1.0.0`
- [x] Name: "Inkwell - Gmail AI Assistant"
- [x] Description present
- [x] Icons defined (16, 48, 128)
- [x] Permissions justified
- [x] Host permissions: `mail.google.com` and backend URL

#### Files to Verify
- [ ] All icons exist (`icons/icon16.png`, `icon48.png`, `icon128.png`)
- [ ] No hardcoded localhost URLs
- [ ] No debug `console.log()` statements (or minimal)
- [ ] Error handling is user-friendly
- [ ] Privacy policy URL ready

### 🎨 Store Listing Assets

#### Required
- [ ] **128x128 icon** - Store listing
- [ ] **Screenshots** (1280x800 or 640x400):
  - Extension in action on Gmail
  - AI response generation
  - Authentication flow

#### Optional but Recommended
- [ ] Promotional images
- [ ] Small promotional tile (440x280)
- [ ] Large promotional tile (920x680)

### 📝 Store Listing Content

#### Basic Info
- **Name**: Inkwell - Gmail AI Assistant (or shorter if needed)
- **Summary**: "AI-powered email assistance for Gmail: smart summaries, quick replies, and action items." (132 chars max)
- **Description**: Full feature description
- **Category**: Productivity
- **Language**: English (US)

#### Privacy & Permissions
- **Privacy Policy URL**: Required
- **Single Purpose**: "Enhance Gmail with AI-powered email assistance"
- **Permission Justification**:
  - `mail.google.com`: "To inject AI assistant UI into Gmail interface"
  - `storage`: "To securely store authentication tokens"
  - Backend URL: "To communicate with AI service for email processing"

### 🔒 Privacy Policy Requirements

Your privacy policy must cover:
1. **Data Collection**: What data is collected?
   - Email content (processed, not stored)
   - User authentication tokens
   - Usage statistics

2. **Data Usage**: How is data used?
   - Email content sent to OpenAI API for processing
   - Authentication for user accounts
   - Usage tracking for subscription limits

3. **Data Storage**: Where is data stored?
   - Backend server (Vercel)
   - Database (Neon PostgreSQL)
   - OpenAI API (temporary processing)

4. **Third-Party Services**:
   - OpenAI (email processing)
   - Google OAuth (authentication)
   - Stripe (payments)

5. **User Rights**:
   - Data deletion
   - Account deletion
   - Data export

### 📋 Submission Steps

1. **Package Extension**
   ```bash
   cd /Users/bobbryden/gmail-ai-assistant
   ./package-for-store.sh 1.0.0
   ```

2. **Go to Chrome Web Store Developer Dashboard**
   - https://chrome.google.com/webstore/devconsole
   - Sign in with Google account
   - Click "New Item"

3. **Upload ZIP**
   - Upload `gmail-ai-assistant-v1.0.0.zip`
   - Wait for processing

4. **Fill Store Listing**
   - Name, description, category
   - Upload icons and screenshots
   - Add privacy policy URL

5. **Review Permissions**
   - Justify each permission
   - Explain single purpose

6. **Submit for Review**
   - Review takes 1-3 business days
   - You'll receive email updates

### 🚨 Common Rejection Reasons

1. **Missing Privacy Policy** - Must have a publicly accessible URL
2. **Vague Permissions** - Be specific about why you need Gmail access
3. **Broken Functionality** - Test thoroughly before submitting
4. **Policy Violations** - Review Chrome Web Store policies
5. **Incomplete Manifest** - All required fields must be present

### 📝 Quick Commands

```bash
# Package extension
cd /Users/bobbryden/gmail-ai-assistant
./package-for-store.sh 1.0.0

# Verify ZIP contents
unzip -l ../gmail-ai-assistant-v1.0.0.zip | head -30

# Check manifest
unzip -p ../gmail-ai-assistant-v1.0.0.zip manifest.json | jq .
```

---

**Next Steps:**
1. Create privacy policy HTML page
2. Take screenshots of extension in action
3. Package extension using the script
4. Submit to Chrome Web Store
