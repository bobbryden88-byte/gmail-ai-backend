# 🚀 Google OAuth Implementation - Quick Reference

## ⏱️ Time Estimate: **14-20 hours** (1.75-2.5 days)

## 📋 Current Auth Setup

**Extension:**
- Email/password → JWT token stored in `chrome.storage.sync`
- UI: `popup/auth.html` + `popup/auth.js`
- Service: `utils/auth-service.js`

**Backend:**
- Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/google` (incomplete)
- Database: PostgreSQL, User model has `email`, `password`, `name`
- **Missing:** `googleId` field, proper Google token verification

## 📝 Files to Change

### Extension (6 files)
1. `manifest.json` - Add `"identity"` permission + OAuth client ID (15 min)
2. `utils/auth-service.js` - Add `googleSignIn()` method (2-3 hours)
3. `popup/auth.html` - Add Google sign-in button (30 min)
4. `popup/auth.js` - Add button handler (1 hour)
5. `popup/auth.css` - Style Google button (30 min)
6. `content/onboarding-modal.html` - Update step 2 text (5 min)

### Backend (4 files)
7. `prisma/schema.prisma` - Add `googleId` and `authProvider` fields (30 min)
8. `src/routes/auth.js` - Replace incomplete `/api/auth/google` endpoint (3-4 hours)
9. `package.json` - Add `google-auth-library` dependency (10 min)
10. `.env` - Add `GOOGLE_CLIENT_ID` (15 min)

### New Files (2 files)
11. `src/services/google-auth.js` - Google token verification service (1-2 hours)
12. `utils/google-auth-service.js` - Optional: separate Google OAuth logic (1-2 hours)

## ⏱️ Time Breakdown

| Task | Time | Complexity |
|------|------|------------|
| Google Cloud Console setup | 2-3 hours | Medium |
| Manifest.json updates | 15 min | Low |
| Chrome extension auth flow | 3-4 hours | Medium |
| Backend token verification | 3-4 hours | Medium-High |
| UI updates | 1-2 hours | Low-Medium |
| Database migration | 30 min | Low |
| Testing & edge cases | 4-6 hours | High |
| **TOTAL** | **14-20 hours** | **Medium-High** |

## 🎯 Hardest Part

**Backend Token Verification & Account Linking** (High Complexity)

**Why:**
- Must verify Google ID tokens with Google's servers
- Need to handle account linking (email vs Google)
- Database schema changes (make password optional)
- Many edge cases to handle

## ⚠️ Potential Issues

1. **Account Linking:** What if user has email account, then signs in with Google using same email?
   - **Solution:** Link accounts - allow both auth methods

2. **Password Field:** Google users don't have passwords
   - **Solution:** Already optional (`String?`) - just don't require it

3. **Chrome Identity API:** Requires user to be signed into Chrome
   - **Solution:** Show helpful error if not signed in

4. **Extension ID Changes:** Dev vs production have different IDs
   - **Solution:** Use different OAuth credentials for each

## 📋 Implementation Order

1. **Setup** (2-3 hours): Google Cloud Console, manifest, dependencies
2. **Database** (30 min): Schema migration
3. **Backend** (3-4 hours): Token verification, endpoint update
4. **Extension** (3-4 hours): Auth flow, UI updates
5. **Testing** (4-6 hours): Edge cases, account linking
6. **Polish** (1 hour): Documentation

## 🔑 Key Code Changes

### Manifest.json
```json
{
  "permissions": ["identity", "storage", "activeTab"],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  }
}
```

### Database Schema
```prisma
model User {
  googleId     String?  // Google user ID
  authProvider String?  // 'email' or 'google'
  password     String?  // Optional (Google users don't have passwords)
}
```

### Extension Auth Service
```javascript
static async googleSignIn() {
  const token = await chrome.identity.getAuthToken({ interactive: true });
  const response = await fetch(`${BASE_URL}/api/auth/google`, {
    method: 'POST',
    body: JSON.stringify({ idToken: token })
  });
  // Store JWT token same as email login
}
```

### Backend Verification
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
const payload = ticket.getPayload();
```

## ✅ Ready to Start?

See `GOOGLE_OAUTH_IMPLEMENTATION_ANALYSIS.md` for detailed implementation guide.
