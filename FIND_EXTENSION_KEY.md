# 🔑 Find Extension Key from Published Extension

## What You Provided

You provided: `oicpmfbmankanehinmchmbakcjmlmodc`

This is the **Extension ID**, not the "key" field. The "key" is a long cryptographic string in `manifest.json`.

## How to Find the Actual "key"

### Method 1: From Extension Folder

1. **Open Finder** (Mac) or File Explorer (Windows)
2. **Navigate to extension folder:**
   - **Mac:** 
     ```
     ~/Library/Application Support/Google/Chrome/Default/Extensions/oicpmfbmankanehinmchmbakcjmlmodc/
     ```
   - **Windows:**
     ```
     %LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\oicpmfbmankanehinmchmbakcjmlmodc\
     ```
3. **Open the version folder** (e.g., `1.1.0/` or latest version number)
4. **Open `manifest.json`** in a text editor
5. **Look for `"key"` field** - it's a long string like:
   ```json
   "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
   ```
6. **Copy the entire key value** (the long string)

### Method 2: Quick Terminal Command

Run this command to find and show the key:

**Mac:**
```bash
find ~/Library/Application\ Support/Google/Chrome/Default/Extensions/oicpmfbmankanehinmchmbakcjmlmodc -name "manifest.json" -exec grep -A 0 '"key"' {} \;
```

**Or simpler:**
```bash
cat ~/Library/Application\ Support/Google/Chrome/Default/Extensions/oicpmfbmankanehinmchmbakcjmlmodc/*/manifest.json | grep -A 0 '"key"'
```

## Alternative: Test with Live Extension Instead

Since finding the key might be tricky, **easier solution:**

1. **Create OAuth client for live Extension ID:**
   - Item ID: `oicpmfbmankanehinmchmbakcjmlmodc`
2. **Test with live extension** (from Chrome Web Store)
3. **Should work immediately** ✅

This is actually simpler and will work right away!

---

**Either find the "key" from manifest.json, or test with live extension using OAuth client for `oicpmfbmankanehinmchmbakcjmlmodc`!**
