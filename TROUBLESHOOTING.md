# 🔧 Troubleshooting Guide - Gmail AI Assistant

## Common Issues and Solutions

---

## 🚨 **Backend Issues**

### **1. Server Won't Start**

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

### **2. Database Connection Error**

**Error:** `Can't reach database server`

**Solution:**
```bash
# Re-run migrations
npx prisma migrate dev --name fix

# Regenerate Prisma client
npx prisma generate

# Check database file exists
ls -la prisma/dev.db
```

---

### **3. OpenAI API Error**

**Error:** `The OPENAI_API_KEY environment variable is missing`

**Solution:**
1. Check `.env` file exists
2. Verify `OPENAI_API_KEY="sk-..."`  is set
3. Restart server: `npm run dev`

---

### **4. Monthly Usage Not Incrementing**

**Issue:** Monthly usage shows 0 even after multiple requests

**Solution:**
- Backend fix applied (returns `monthlyUsed` in response)
- Extension updated (stores `monthlyUsage` in storage)
- Reload extension and try again

**Verify:**
```bash
# Check user in database
npx prisma studio
# Look at User table → Check monthlyUsage field
```

---

## 🔌 **Extension Issues**

### **1. Extension Won't Load**

**Error:** Manifest errors in chrome://extensions/

**Solution:**
1. Check `manifest.json` is valid JSON
2. Verify all file paths exist
3. Check for syntax errors in JavaScript files
4. Remove and re-add extension

---

### **2. Auth Popup Not Showing**

**Issue:** Old configuration popup appears instead of auth

**Solution:**
1. Check `manifest.json`:
   ```json
   "action": {
     "default_popup": "popup/auth.html"  // ← Must be auth.html
   }
   ```
2. Reload extension
3. Hard refresh (remove and re-add if needed)

---

### **3. SendMessage Error**

**Error:** `Cannot read properties of undefined (reading 'sendMessage')`

**Solution:**
- Fix applied (added Chrome runtime checks)
- Reload extension
- Reload Gmail tab
- Check background script is running in chrome://extensions/

---

### **4. Button Overlapping Content**

**Issue:** AI Assistant button blocks Clear button

**Solution:**
- Fix applied (button hides when panel opens)
- Reload extension
- Test: Button should disappear when panel opens

---

### **5. Raw JSON Displaying**

**Issue:** Shows ```json {...}``` instead of formatted responses

**Solution:**
- Backend fix applied (proper JSON parsing)
- Server should auto-reload with nodemon
- If not, restart: `npm run dev`
- Extension should now show formatted responses

---

## 🔍 **Debugging Tools**

### **Check Backend Status:**
```bash
# Is server running?
curl http://localhost:3000/health

# Check process
ps aux | grep nodemon

# View logs
# Check terminal where you ran npm run dev
```

### **Check Extension Status:**
```bash
# In Chrome
chrome://extensions/

# Inspect background script
Click "Inspect views: service worker" under your extension

# Check storage
Inspect popup → Application tab → Storage → sync
```

### **Check Database:**
```bash
# View database in Prisma Studio
npx prisma studio

# Or query directly
npx prisma db execute --stdin < query.sql
```

### **Check Extension Console:**
1. Open Gmail
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for "GAI:" prefixed logs

---

## 📊 **Verify Usage Tracking**

### **Test Daily Usage:**
1. Generate 3 responses
2. Check popup: Should show "3/10"
3. Check backend logs: Should show dailyUsage: 3

### **Test Monthly Usage:**
1. Generate 3 responses
2. Check popup: Should show "3/300"
3. Check backend logs: Should show monthlyUsage: 3

### **Verify in Database:**
```bash
npx prisma studio
# Navigate to User table
# Check dailyUsage and monthlyUsage fields
```

---

## 🔐 **Authentication Issues**

### **Can't Register:**
- Check password is minimum 6 characters
- Verify email format is valid
- Check backend logs for specific error
- Verify database is accessible

### **Can't Login:**
- Verify credentials are correct
- Check user exists in database
- Check backend logs for auth errors
- Try registering new account

### **Token Expired:**
- Login again to get new token
- Tokens expire after 30 days
- Extension auto-detects and shows login prompt

---

## 🌐 **Network Issues**

### **Backend Not Reachable:**
```bash
# Verify backend is running
curl http://localhost:3000/health

# Check firewall settings
# Check no VPN blocking localhost

# Try different port
PORT=3001 npm run dev
```

### **CORS Errors:**
```javascript
// Backend should show this in logs:
Access to fetch at 'http://localhost:3000/api/ai/generate' from origin 'chrome-extension://...' has been blocked by CORS

// If you see this, backend CORS is already fixed
// Just reload extension and try again
```

---

## 💾 **Database Issues**

### **Reset Database:**
```bash
# Delete and recreate
rm prisma/dev.db
npx prisma migrate dev --name reset
npx prisma generate
```

### **View Database:**
```bash
# Open Prisma Studio
npx prisma studio

# Opens in browser at localhost:5555
```

### **Manual Query:**
```bash
# SQLite command line
sqlite3 prisma/dev.db "SELECT * FROM users;"
```

---

## 🔄 **Reset Everything**

If all else fails:

### **Reset Backend:**
```bash
cd /Users/bobbryden/gmail-ai-backend

# Clean install
rm -rf node_modules package-lock.json
npm install

# Reset database
rm prisma/dev.db
npx prisma migrate dev --name fresh-start
npx prisma generate

# Restart server
npm run dev
```

### **Reset Extension:**
1. Go to `chrome://extensions/`
2. Remove the extension
3. Clear browsing data (chrome://settings/clearBrowserData)
   - Check "Cookies and other site data"
   - Time range: "All time"
4. Re-add extension (Load unpacked)
5. Reload Gmail tab

---

## 📝 **Logs to Check**

### **Backend Logs (Terminal):**
Look for:
- ✅ "Server running on port 3000"
- ✅ "New user registered: ..."
- ✅ "User logged in: ..."
- ✅ "Sending authenticated response: {..."
- ✅ "dailyUsage: X, monthlyUsage: Y"

### **Extension Logs (Browser Console):**
Look for:
- ✅ "GAI: Content script loaded"
- ✅ "GAI: Backend API request"
- ✅ "GAI: Backend response status: 200"
- ✅ "✅ Usage stats updated in storage: {..."

### **Background Script Logs:**
1. chrome://extensions/
2. Click "Inspect views: service worker"
3. Look for:
   - ✅ "Gmail AI Assistant installed"
   - ✅ "GAI: Using authenticated endpoint with token"
   - ✅ "✅ Usage stats updated in storage"

---

## 🆘 **Still Having Issues?**

### **Checklist:**
- [ ] Backend running? (curl http://localhost:3000/health)
- [ ] Extension loaded? (visible in chrome://extensions/)
- [ ] Logged in? (click extension icon to check)
- [ ] On Gmail? (mail.google.com)
- [ ] Email open? (viewing an email)
- [ ] Panel visible? (Alt+Shift+A to toggle)

### **Get More Help:**
1. Check all documentation files
2. Review backend logs for errors
3. Check browser console for errors
4. Verify .env file has all required values
5. Try with a fresh user account

---

## ✅ **System Health Check**

Run this to verify everything is working:

```bash
# Backend health
curl http://localhost:3000/health

# Register test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"health-check@test.com","password":"test123","name":"Health Check"}'

# Generate test response
TOKEN="your-token-from-above"
curl -X POST http://localhost:3000/api/ai/generate-test \
  -H "Content-Type: application/json" \
  -d '{"emailContent":{"subject":"Test","sender":"test@test.com","body":"Test email"},"style":"brief"}'

# If all three work: ✅ System healthy!
```

---

**Most issues can be resolved by reloading the extension and restarting the backend!** 🔄

