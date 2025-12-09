# 🔍 Inline Prompt Box Debugging Guide

## Issue
The inline prompt box ("Reply to this message with...") is not appearing in Gmail reply/compose windows.

## Enhanced Logging Added

I've added comprehensive logging throughout the inline prompt box code to help diagnose the issue:

### 1. **Initialization Logging**
- Logs when initialization starts
- Logs current URL and document state
- Logs each initialization step

### 2. **Compose Detection Logging**
- Logs when MutationObserver triggers
- Logs compose area search attempts
- Logs compose area details when found

### 3. **Box Creation Logging**
- Logs when box is created (template vs direct)
- Logs box HTML preview
- Logs box element details

### 4. **DOM Insertion Logging**
- Logs insertion point details
- Logs container and reference elements
- Logs insertion position

### 5. **Box Verification Logging**
- Verifies box is in DOM after insertion
- Checks box dimensions and visibility
- Checks computed styles

## Manual Testing Steps

### Step 1: Open Gmail and Reply
1. Go to Gmail
2. Open any email
3. Click "Reply"
4. Open DevTools (F12) → Console

### Step 2: Check Console Logs
Filter by "GAI Inline" to see all inline box logs:

```
GAI Inline: ========== INITIALIZING INLINE PROMPT BOX ==========
GAI Inline: Initialization started at [timestamp]
GAI Inline: ========== Setting up compose observer ==========
GAI Inline: ✅ MutationObserver started, watching for compose windows
GAI Inline: ========== Checking for existing compose ==========
```

### Step 3: Manual Compose Detection Test
```javascript
// Test compose area detection
const compose = document.querySelector('[contenteditable="true"][role="textbox"]');
console.log('Compose found:', !!compose);
if (compose) {
  console.log('Compose details:', {
    visible: compose.offsetParent !== null,
    dimensions: compose.getBoundingClientRect(),
    className: compose.className
  });
}
```

### Step 4: Manual Box Injection Test
```javascript
// Try manual trigger
if (typeof gaiTriggerInlineBox === 'function') {
  console.log('Triggering inline box...');
  gaiTriggerInlineBox();
} else {
  console.error('gaiTriggerInlineBox not available');
}

// Check if box exists
setTimeout(() => {
  const box = document.querySelector('#gai-inline-prompt-box');
  console.log('Box in DOM:', !!box);
  if (box) {
    console.log('Box details:', {
      inDOM: box.isConnected,
      visible: box.offsetParent !== null,
      dimensions: box.getBoundingClientRect(),
      display: window.getComputedStyle(box).display,
      visibility: window.getComputedStyle(box).visibility
    });
  }
}, 2000);
```

### Step 5: Check All Compose Selectors
```javascript
// Test all possible compose selectors
const selectors = [
  '[contenteditable="true"][role="textbox"]',
  '[contenteditable="true"][aria-label*="Message Body"]',
  '.Am[contenteditable="true"]',
  '[g_editable="true"]',
  'div[role="dialog"] div[aria-label="Message Body"]',
  '.Am.Al.editable'
];

selectors.forEach(selector => {
  const el = document.querySelector(selector);
  console.log(`${selector}:`, el ? '✅ Found' : '❌ Not found');
  if (el) {
    console.log('  Visible:', el.offsetParent !== null);
    console.log('  Dimensions:', el.getBoundingClientRect());
  }
});
```

## Expected Console Output

When working correctly, you should see:

```
GAI Inline: ========== INITIALIZING INLINE PROMPT BOX ==========
GAI Inline: Initialization started at [timestamp]
GAI Inline: ========== Setting up compose observer ==========
GAI Inline: ✅ MutationObserver started, watching for compose windows
GAI Inline: ========== Checking for existing compose ==========
GAI Inline: Checking for compose area (attempt 1 / 10)
GAI Inline: ========== Finding compose area ==========
GAI Inline: Found element with selector: [contenteditable="true"][role="textbox"]
GAI Inline: ✅ Valid compose area found
GAI Inline: ========== injectBox called ==========
GAI Inline: Starting box injection for compose area
GAI Inline: ========== Creating box directly (fallback method) ==========
GAI Inline: ✅ Box created directly with all elements
GAI Inline: ========== insertBoxIntoDOM called ==========
GAI Inline: ✅ Box styles applied, event listeners attached
GAI Inline: ========== Box verification ==========
GAI Inline: Box in DOM: true
GAI Inline: Box dimensions: { width: 600, height: 50 }
GAI Inline: Box offsetParent: true
```

## Common Issues & Solutions

### Issue 1: Compose Area Not Found
**Symptoms:**
- Logs show "No compose area found"
- All selectors return null

**Solution:**
- Gmail's DOM structure may have changed
- Check if reply window is actually open
- Try different selectors (see Step 5 above)

### Issue 2: Box Created But Not Visible
**Symptoms:**
- Box in DOM: true
- Box dimensions: { width: 0, height: 0 }
- Box offsetParent: null

**Solution:**
- Check if parent container is hiding it
- Verify CSS is loaded
- Check z-index conflicts

### Issue 3: Box Not Inserted
**Symptoms:**
- Box created but not in DOM
- Insertion point container is null

**Solution:**
- Check `findInsertionPoint()` logic
- Verify compose area parent structure
- Try inserting directly into compose area parent

## Next Steps

1. **Reload extension** and test
2. **Open reply window** in Gmail
3. **Check console** for "GAI Inline:" logs
4. **Run manual tests** above
5. **Share console output** for analysis

The enhanced logging will show exactly where the process is failing!
