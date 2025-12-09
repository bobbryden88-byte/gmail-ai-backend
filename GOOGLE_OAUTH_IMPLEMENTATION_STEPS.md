# 🚀 Google OAuth Implementation - Step-by-Step Guide

## Phase 1: Google Cloud Console Setup (2-3 hours)

### Step 1.1: Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable "Google+ API" (or "People API")
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: **Chrome App**
6. Name: "Inkwell Gmail AI Assistant"
7. **Copy Client ID** (you'll need this)

### Step 1.2: Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. User Type: **External** (unless you have Google Workspace)
3. Fill in required fields:
   - App name: "Inkwell - Gmail AI Assistant"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your email) if in testing mode
6. Save

### Step 1.3: Get Extension ID
1. Load extension in Chrome: `chrome://extensions/`
2. Enable Developer mode
3. Find your extension ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
4. **Save this ID** - you'll need it

### Step 1.4: Update OAuth Credentials
1. Go back to OAuth credentials
2. Add authorized redirect URI:
   - `https://YOUR_EXTENSION_ID.chromiumapp.org/`
   - Replace `YOUR_EXTENSION_ID` with actual ID
3. Save credentials

**✅ Deliverable:** Client ID and Extension ID ready

---

## Phase 2: Database Schema Updates (30 minutes)

### Step 2.1: Update Prisma Schema
**File:** `/Users/bobbryden/gmail-ai-backend/prisma/schema.prisma`

**Change:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?  // Already optional - good!
  
  // Add these fields:
  googleId     String?  // Google user ID (sub claim from token)
  authProvider String?  // 'email' or 'google'
  
  isPremium Boolean  @default(false)
  // ... rest of fields stay the same
}
```

### Step 2.2: Create Migration
```bash
cd /Users/bobbryden/gmail-ai-backend
npx prisma migrate dev --name add_google_oauth
```

### Step 2.3: Generate Prisma Client
```bash
npx prisma generate
```

**✅ Deliverable:** Database updated with Google OAuth fields

---

## Phase 3: Backend Implementation (3-4 hours)

### Step 3.1: Install Dependencies
**File:** `/Users/bobbryden/gmail-ai-backend/package.json`

```bash
cd /Users/bobbryden/gmail-ai-backend
npm install google-auth-library
```

### Step 3.2: Add Environment Variable
**File:** `/Users/bobbryden/gmail-ai-backend/.env`

Add:
```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Also add to Vercel environment variables** (if deployed)

### Step 3.3: Create Google Auth Service
**File:** `/Users/bobbryden/gmail-ai-backend/src/services/google-auth.js` (NEW FILE)

```javascript
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user information
 * @param {string} idToken - Google ID token from chrome.identity
 * @returns {Promise<Object>} User info: { email, name, googleId, picture }
 */
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      googleId: payload.sub, // Google's unique user ID
      picture: payload.picture
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
}

module.exports = {
  verifyGoogleToken
};
```

### Step 3.4: Update Auth Route
**File:** `/Users/bobbryden/gmail-ai-backend/src/routes/auth.js`

**Replace the existing `/api/auth/google` endpoint** (lines 147-193) with:

```javascript
const { verifyGoogleToken } = require('../services/google-auth');

// Google OAuth authentication
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);
    
    if (!googleUser.email) {
      return res.status(400).json({ error: 'Email not found in Google token' });
    }

    // Find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() }
    });

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            authProvider: 'google',
            // Update name if not set
            name: user.name || googleUser.name
          }
        });
      }
    } else {
      // New user - create account
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          googleId: googleUser.googleId,
          authProvider: 'google',
          password: null, // Google users don't have passwords
          isPremium: false,
          dailyUsage: 0,
          monthlyUsage: 0
        }
      });
      
      console.log(`✅ New user registered via Google: ${user.email} (ID: ${user.id})`);
    }

    // Generate JWT token (same format as email/password login)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isPremium: user.isPremium 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`✅ User logged in via Google: ${user.email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        dailyUsage: user.dailyUsage || 0,
        monthlyUsage: user.monthlyUsage || 0
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});
```

**✅ Deliverable:** Backend can verify Google tokens and create/link accounts

---

## Phase 4: Extension Implementation (3-4 hours)

### Step 4.1: Update Manifest
**File:** `/Users/bobbryden/gmail-ai-assistant/manifest.json`

**Add to `permissions` array:**
```json
"permissions": [
  "identity",  // ADD THIS
  "storage",
  "activeTab"
],
```

**Add new `oauth2` section** (after `commands`):
```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
},
```

### Step 4.2: Add Google Sign-In Method to AuthService
**File:** `/Users/bobbryden/gmail-ai-assistant/utils/auth-service.js`

**Add this method to the `AuthService` class** (after `login` method):

```javascript
static async googleSignIn() {
  try {
    console.log('🔵 Starting Google sign-in...');
    
    // Get Google OAuth token using Chrome Identity API
    const googleToken = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        { 
          interactive: true,
          scopes: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ]
        },
        (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        }
      );
    });

    console.log('✅ Google token obtained');

    // Exchange Google token for our backend JWT
    const response = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: googleToken })
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Store token and user info (same as email/password login)
      await chrome.storage.sync.set({
        userToken: data.token,
        userId: data.user.id,
        userEmail: data.user.email,
        userName: data.user.name,
        isPremium: data.user.isPremium,
        dailyUsage: data.user.dailyUsage || 0,
        monthlyUsage: data.user.monthlyUsage || 0
      });

      console.log('✅ User logged in via Google:', data.user.email);
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Google authentication failed' };
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Handle specific errors
    if (error.message.includes('OAuth2')) {
      return { success: false, error: 'Please sign in to Chrome to use Google sign-in' };
    }
    
    return { success: false, error: error.message || 'Failed to sign in with Google' };
  }
}
```

### Step 4.3: Add Google Sign-In Button to HTML
**File:** `/Users/bobbryden/gmail-ai-assistant/popup/auth.html`

**In the login form** (after the "Login" button, around line 47):

```html
<!-- Add divider -->
<div style="text-align: center; margin: 20px 0; position: relative;">
  <div style="border-top: 1px solid #dadce0; position: absolute; top: 50%; left: 0; right: 0;"></div>
  <span style="background: white; padding: 0 10px; color: #5f6368; font-size: 14px;">or</span>
</div>

<!-- Google Sign-In Button -->
<button type="button" id="google-sign-in-btn" class="btn btn-google">
  <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.163-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.8 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.962-2.184l-2.908-2.258c-.806.54-1.837.86-3.054.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.03l2.99-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.302C4.66 5.167 6.65 3.58 9 3.58z"/>
  </svg>
  Sign in with Google
</button>
```

**In the register form** (after "Create Account" button, around line 97):

```html
<!-- Add same divider and button -->
<div style="text-align: center; margin: 20px 0; position: relative;">
  <div style="border-top: 1px solid #dadce0; position: absolute; top: 50%; left: 0; right: 0;"></div>
  <span style="background: white; padding: 0 10px; color: #5f6368; font-size: 14px;">or</span>
</div>

<button type="button" id="google-sign-up-btn" class="btn btn-google">
  <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
    <!-- Same SVG as above -->
  </svg>
  Sign up with Google
</button>
```

### Step 4.4: Style Google Button
**File:** `/Users/bobbryden/gmail-ai-assistant/popup/auth.css`

**Add at the end of the file:**

```css
/* Google Sign-In Button */
.btn-google {
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
}

.btn-google:hover {
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn-google:active {
  background: #f1f3f4;
}

.btn-google svg {
  flex-shrink: 0;
}
```

### Step 4.5: Add Event Handlers
**File:** `/Users/bobbryden/gmail-ai-assistant/popup/auth.js`

**Add after the existing event listeners** (around line 191, after `backToLoginLink`):

```javascript
// Google Sign-In Button (Login Form)
const googleSignInBtn = document.getElementById('google-sign-in-btn');
if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    googleSignInBtn.disabled = true;
    googleSignInBtn.textContent = 'Signing in...';
    
    try {
      const result = await AuthService.googleSignIn();
      
      if (result.success) {
        showStatus('Login successful! Closing popup...', 'success');
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        showStatus(result.error || 'Google sign-in failed', 'error');
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = '<svg>...</svg> Sign in with Google';
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      showStatus('Failed to sign in with Google. Please try again.', 'error');
      googleSignInBtn.disabled = false;
      googleSignInBtn.innerHTML = '<svg>...</svg> Sign in with Google';
    }
  });
}

// Google Sign-Up Button (Register Form)
const googleSignUpBtn = document.getElementById('google-sign-up-btn');
if (googleSignUpBtn) {
  googleSignUpBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    googleSignUpBtn.disabled = true;
    googleSignUpBtn.textContent = 'Signing up...';
    
    try {
      const result = await AuthService.googleSignIn();
      
      if (result.success) {
        showStatus('Account created! Closing popup...', 'success');
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        showStatus(result.error || 'Google sign-up failed', 'error');
        googleSignUpBtn.disabled = false;
        googleSignUpBtn.innerHTML = '<svg>...</svg> Sign up with Google';
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      showStatus('Failed to sign up with Google. Please try again.', 'error');
      googleSignUpBtn.disabled = false;
      googleSignUpBtn.innerHTML = '<svg>...</svg> Sign up with Google';
    }
  });
}
```

### Step 4.6: Update Onboarding Modal
**File:** `/Users/bobbryden/gmail-ai-assistant/content/onboarding-modal.html`

**Update Step 2 description** (line 32):
```html
<p class="gmail-ai-onboarding-step-description">Sign in with Google or create an account with email to start using AI-powered email assistance.</p>
```

**✅ Deliverable:** Extension can sign in with Google

---

## Phase 5: Testing (4-6 hours)

### Step 5.1: Test First-Time Google Sign-In
1. Clear extension storage: `chrome.storage.sync.clear()`
2. Click extension icon
3. Click "Sign in with Google"
4. **Expected:** Google popup appears → User selects account → Extension closes → User logged in

### Step 5.2: Test Account Linking
1. Create account with email/password
2. Logout
3. Sign in with Google using same email
4. **Expected:** Accounts linked, user can use either method

### Step 5.3: Test Error Cases
1. **User cancels Google popup:**
   - Click Google sign-in
   - Cancel popup
   - **Expected:** Error message shown, button re-enabled

2. **User not signed into Chrome:**
   - Sign out of Chrome
   - Try Google sign-in
   - **Expected:** Helpful error message

3. **Network error:**
   - Disconnect internet
   - Try Google sign-in
   - **Expected:** Error message about network

### Step 5.4: Test Token Refresh
1. Sign in with Google
2. Wait for token to expire (or manually expire)
3. Use extension
4. **Expected:** Token refreshes automatically (Chrome handles this)

### Step 5.5: Test Logout
1. Sign in with Google
2. Click logout
3. **Expected:** User logged out, can sign in again

**✅ Deliverable:** All test cases pass

---

## Phase 6: Edge Cases & Polish (2-3 hours)

### Step 6.1: Handle Account Linking Conflicts
**File:** `/Users/bobbryden/gmail-ai-backend/src/routes/auth.js`

**Enhance the `/api/auth/google` endpoint** to handle:
- User with email account tries Google → Link accounts
- User with Google account tries email/password → Show message to use Google

### Step 6.2: Update Password Reset Logic
**File:** `/Users/bobbryden/gmail-ai-assistant/popup/auth.js`

**Hide "Forgot Password" link for Google users:**
```javascript
// In checkAuthStatus, if user is authenticated:
const { authProvider } = await chrome.storage.sync.get(['authProvider']);
if (authProvider === 'google') {
  // Hide forgot password link
  forgotPasswordLink.style.display = 'none';
}
```

### Step 6.3: Add Loading States
- Show spinner on Google button during sign-in
- Disable button during process
- Show success message

### Step 6.4: Update Documentation
- Update README with Google sign-in instructions
- Document OAuth setup process

**✅ Deliverable:** Production-ready implementation

---

## ✅ Final Checklist

Before deploying:

- [ ] Google Cloud Console OAuth credentials created
- [ ] Extension ID added to OAuth redirect URIs
- [ ] `GOOGLE_CLIENT_ID` added to backend `.env` and Vercel
- [ ] Database migration completed
- [ ] Backend `/api/auth/google` endpoint tested
- [ ] Extension Google sign-in button works
- [ ] Account linking works (email + Google)
- [ ] Error handling works (user cancels, network errors)
- [ ] Logout works
- [ ] Tested on fresh Chrome profile
- [ ] Documentation updated

---

## 🚀 Ready to Start?

Begin with **Phase 1** (Google Cloud Console setup) - this is the foundation for everything else!
