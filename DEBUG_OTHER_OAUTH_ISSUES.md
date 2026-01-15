# 🔍 Debug OAuth - Extension ID Matches, But Still Failing

## Extension ID Matches ✅

- Extension ID: `jjpbalnpbnmhbliggpoemmdceikojpld` ✅
- OAuth Client Item ID: `jjpbalnpbnmhbliggpoemmdceikojpld` ✅
- They match exactly ✅

**So the issue is something else.**

## Other Possible Issues

### Issue 1: OAuth Consent Screen Not Configured

**Check:**
1. Go to: **APIs & Services** → **OAuth consent screen**
2. Does it show:
   - User Type: External (or Internal)
   - App name: Something (not empty)
   - Your email
   - Publishing status: Testing or In production

**If not configured:**
1. Click **"Configure Consent Screen"**
2. User Type: **External**
3. App name: **Inkwell**
4. User support email: Your email
5. Developer contact: Your email
6. Click **Save and Continue**
7. Scopes: Click **Save and Continue** (no scopes needed)
8. Test users: Click **Save and Continue**
9. Summary: Click **Back to Dashboard**

### Issue 2: OAuth Client Not Active

**Check:**
1. Go to: **Credentials**
2. Find your OAuth client
3. Make sure it's **not disabled**
4. Status should be **Active**

### Issue 3: Chrome Cache/Old OAuth Client

**Try:**
1. **Close ALL Chrome windows** (completely exit)
2. **Wait 2 minutes**
3. **Reopen Chrome**
4. Go to: `chrome://extensions/`
5. **Remove extension** (click remove)
6. **Reload extension** (load unpacked again)
7. **Try sign-in**

### Issue 4: OAuth Client Just Created - Not Propagated

**If you just created the OAuth client:**
- **Wait 15-20 minutes** (Google can take time)
- **Then try again**

### Issue 5: Wrong Google Cloud Project

**Check:**
1. Make sure you're in the **correct Google Cloud project**
2. The OAuth client should be in the same project
3. Check project name at top of Google Cloud Console

### Issue 6: OAuth Client Type Issue

**Verify:**
1. Go to: **Credentials**
2. Find your OAuth client
3. Click to view details
4. **Type should be:** "Chrome Extension" (not "Web application")
5. **Item ID should be:** `jjpbalnpbnmhbliggpoemmdceikojpld`

### Issue 7: Extension Not Published/Verified

**For Chrome Extensions, sometimes you need:**
1. Extension published to Chrome Web Store (even if unlisted)
2. Or extension verified in Google Cloud Console

**Check:**
- Is your extension published to Chrome Web Store?
- If yes, try using the **live Extension ID** instead

### Issue 8: Try Different Approach

**Alternative: Use Web Application OAuth Client**

If Chrome Extension type doesn't work, try:

1. **Create new OAuth client:**
   - Application type: **Web application**
   - Authorized JavaScript origins: `chrome-extension://jjpbalnpbnmhbliggpoemmdceikojpld`
   - Authorized redirect URIs: `https://jjpbalnpbnmhbliggpoemmdceikojpld.chromiumapp.org/`
   - Create

2. **Update extension code** to use this client ID (but this requires code changes)

## Most Likely: OAuth Consent Screen

**Check OAuth consent screen first:**
1. Go to: **APIs & Services** → **OAuth consent screen**
2. Is it configured?
3. What's the Publishing status?

**If not configured or in "Testing" mode:**
- Configure it properly
- Add test users if needed
- Or publish to production

## Quick Checklist

- [ ] OAuth consent screen configured?
- [ ] OAuth client is Active (not disabled)?
- [ ] Waited 15-20 minutes after creating OAuth client?
- [ ] Completely restarted Chrome?
- [ ] Removed and reloaded extension?
- [ ] In correct Google Cloud project?
- [ ] OAuth client type is "Chrome Extension"?

---

**Check OAuth consent screen first - that's the most common issue when Extension ID matches!**
