# 🔧 Fix: Extension Won't Load Unpacked

## 🎯 **Root Cause**

The `key` field in `manifest.json` matches your **live extension** from Chrome Web Store. Chrome **prevents** loading an unpacked extension with the same `key` as an installed extension.

## ✅ **Solution: Remove `key` for Testing**

For **local testing**, you need a manifest **without** the `key` field. This will give your unpacked extension a **different ID** than the live one.

### Step 1: Backup Current Manifest

```bash
cd /Users/bobbryden/gmail-ai-assistant
cp manifest.json manifest-production.json
```

### Step 2: Use Test Manifest (No Key)

I've created `manifest-test.json` for you. To use it:

```bash
cd /Users/bobbryden/gmail-ai-assistant
cp manifest-test.json manifest.json
```

### Step 3: Load Unpacked Extension

1. Go to: `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select: `/Users/bobbryden/gmail-ai-assistant`
5. Should load successfully! ✅

### Step 4: Note the New Extension ID

After loading, Chrome will assign a **new Extension ID** (different from the live one). You'll need to:

1. **Create a new OAuth client** in Google Cloud Console
2. **Set the Item ID** to this new testing Extension ID
3. **Update `manifest.json`** with the new Client ID

---

## 🔄 **Alternative: Test with Live Extension**

If you just want to **test Google login**, use the **live extension** that's already installed:

1. Open Gmail: https://mail.google.com
2. Click extension icon
3. Click "Sign in with Google"
4. Should work if OAuth client is configured for `oicpmfbmankanehinmchmbakcjmlmodc`

---

## 📦 **For Production (Chrome Web Store)**

When you're ready to **publish to Chrome Web Store**, use the manifest **with** the `key` field:

```bash
cp manifest-production.json manifest.json
```

Then package and upload to Chrome Web Store.

---

## 🐛 **Other Common Issues**

### Issue: "Loading of unpacked extensions is disabled by administrator"

**Check:** Go to `chrome://policy/` and look for `ExtensionInstallBlacklist`

**Solution:** If you're on a work/school computer, you may need admin access or use a personal device.

### Issue: Wrong Folder Selected

**Make sure:** You select `/Users/bobbryden/gmail-ai-assistant` (the folder that **directly contains** `manifest.json`), not a parent folder.

### Issue: Manifest Errors

**Check:** Open Chrome DevTools on `chrome://extensions/` and look for error messages in the Console.

---

**Try removing the `key` field first - that's most likely the issue!**
