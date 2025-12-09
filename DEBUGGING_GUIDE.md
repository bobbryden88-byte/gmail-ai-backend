# 🔍 Gmail AI Assistant - Debugging Guide

## Quick Diagnostic Script

I've created a comprehensive diagnostic script. Here's how to use it:

### Step 1: Open Gmail
1. Go to `https://mail.google.com`
2. Open any email thread (click on an email)

### Step 2: Open DevTools
1. Press `F12` (or right-click → Inspect)
2. Go to the **Console** tab
3. Clear the console (click the 🚫 icon or press `Ctrl+L` / `Cmd+L`)

### Step 3: Run Diagnostic Script

**Option A: Copy the entire diagnostic script**
1. Open the file: `gmail-ai-assistant/DIAGNOSTIC_SCRIPT.js`
2. Copy the entire contents
3. Paste into the console and press Enter

**Option B: Run individual checks**

```javascript
// 1. Check if content script loaded
console.log('=== BASIC CHECKS ===');
console.log('gaiTest exists:', typeof gaiTest);
console.log('gaiTriggerInlineBox exists:', typeof gaiTriggerInlineBox);
console.log('insertAIButton exists:', typeof insertAIButton);

// 2. Check for any GAI logs already present
console.log('=== CHECK FOR EXISTING BUTTON ===');
const existingBtn = document.querySelector('.gmail-ai-assistant-btn');
console.log('Button in DOM:', existingBtn);

// 3. Check Gmail structure
console.log('=== GMAIL STRUCTURE ===');
console.log('Gmail loaded:', !!document.querySelector('div[role="main"]'));
console.log('Toolbar area:', !!document.querySelector('.aeH'));
console.log('Action bar:', !!document.querySelector('.G-atb'));

// 4. List any extension errors
console.log('=== EXTENSION STATUS ===');
chrome.runtime.sendMessage({action: 'ping', type: 'PING'}, response => {
  if (chrome.runtime.lastError) {
    console.error('Background script error:', chrome.runtime.lastError);
  } else {
    console.log('Background script response:', response);
  }
});
```

### Step 4: Check Console Logs

1. **Filter by "GAI":**
   - In the console filter box, type: `GAI`
   - This shows all extension logs

2. **Look for these key messages:**
   ```
   GAI: ========== CONTENT SCRIPT LOADED ==========
   GAI: Content script loaded at [timestamp]
   GAI: Setting up initial button insertion attempts...
   GAI: Initial timeout - attempting button insertion
   GAI: ========== insertAIButton called ==========
   ```

3. **Check for errors:**
   - Look for red error messages
   - Check if any script failed to load

### Step 5: Manual Tests

If the button doesn't appear, try these:

```javascript
// Test 1: Check if functions exist
console.log('gaiTest:', typeof gaiTest);
if (typeof gaiTest === 'function') {
    gaiTest(); // Should log "GAI content script is working!"
}

// Test 2: Try manual button injection
if (typeof insertAIButton === 'function') {
    const result = insertAIButton();
    console.log('Button injection result:', result);
    
    // Check after 1 second
    setTimeout(() => {
        const btn = document.querySelector('.gmail-ai-assistant-btn');
        console.log('Button after injection:', btn);
    }, 1000);
} else {
    console.error('insertAIButton function not available!');
}

// Test 3: Check for reply area
function findGmailReplyArea() {
    const possibleSelectors = [
        'div[role="button"][aria-label*="Reply"]',
        'div[role="button"][aria-label*="reply"]',
        '.ams',
        '.ar9',
        '.aaq',
        '.btC'
    ];
    
    for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log('Found reply area with:', selector);
            const container = element.closest('.ar9, .aaq, .btC, .amn') || element.parentElement;
            return { container, reference: element };
        }
    }
    return { container: null, reference: null };
}

const { container, reference } = findGmailReplyArea();
console.log('Reply area container:', container);
console.log('Reply area reference:', reference);
```

## Common Issues & Solutions

### Issue 1: Content Script Not Loading

**Symptoms:**
- `gaiTest` is `undefined`
- No "GAI: CONTENT SCRIPT LOADED" message
- No extension logs at all

**Possible Causes:**
1. Extension not enabled
2. Manifest.json has wrong URL pattern
3. Script file missing or has syntax error
4. Extension needs to be reloaded

**Solutions:**
1. Go to `chrome://extensions/`
2. Find "Inkwell - Gmail AI Assistant"
3. Make sure it's **enabled** (toggle is ON)
4. Click the **reload** icon (🔄)
5. Refresh Gmail page

### Issue 2: Button Not Injecting

**Symptoms:**
- Content script loaded (`gaiTest` works)
- `insertAIButton` function exists
- But button never appears

**Possible Causes:**
1. Gmail DOM structure changed
2. Reply area selectors outdated
3. MutationObserver not triggering
4. Button created but hidden

**Solutions:**
1. Check if reply area is found:
   ```javascript
   const { container, reference } = findGmailReplyArea();
   console.log('Container:', container);
   console.log('Reference:', reference);
   ```
2. Try manual injection:
   ```javascript
   insertAIButton();
   ```
3. Check if button exists but is hidden:
   ```javascript
   const btn = document.querySelector('.gmail-ai-assistant-btn');
   if (btn) {
       console.log('Button found but hidden:', {
           display: window.getComputedStyle(btn).display,
           visibility: window.getComputedStyle(btn).visibility,
           offsetParent: btn.offsetParent
       });
   }
   ```

### Issue 3: Button Appears Then Disappears

**Symptoms:**
- Button appears briefly
- Then disappears

**Possible Causes:**
1. Gmail's DOM mutations removing it
2. Panel state hiding it
3. CSS conflicts

**Solutions:**
1. Check if panel is open:
   ```javascript
   const panel = document.querySelector('#gai-assistant-panel');
   console.log('Panel open:', panel?.classList.contains('open'));
   ```
2. Check button visibility state:
   ```javascript
   const btn = document.querySelector('.gmail-ai-assistant-btn');
   console.log('Button classes:', btn?.className);
   console.log('Has hidden class:', btn?.classList.contains('gai-panel-open-hidden'));
   ```

## What to Share

When reporting issues, please share:

1. **Console Output:**
   - All messages filtered by "GAI"
   - Any red error messages
   - Output from diagnostic script

2. **Extension Status:**
   - Extension enabled? (from `chrome://extensions/`)
   - Extension version
   - Any errors in extension details page

3. **Browser Info:**
   - Chrome version
   - Gmail URL you're on
   - Whether you're logged into Gmail

4. **Manual Test Results:**
   - Output from `gaiTest()` if it exists
   - Output from `insertAIButton()` if it exists
   - Result of `findGmailReplyArea()`

## Quick Fixes to Try

### Fix 1: Reload Extension
```
chrome://extensions/ → Find extension → Click reload → Refresh Gmail
```

### Fix 2: Hard Refresh Gmail
```
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Fix 3: Clear Extension Storage
```javascript
// In console
chrome.storage.sync.clear(() => {
    console.log('Storage cleared');
    location.reload();
});
```

### Fix 4: Reinstall Extension
1. Go to `chrome://extensions/`
2. Remove extension
3. Reload extension folder
4. Refresh Gmail

---

**Next Steps:** Run the diagnostic script and share the output!
