# 🎯 Gmail Onboarding Modal Integration Guide

This guide shows you how to integrate the onboarding modal into your Gmail content script to guide new users through account setup.

## 📁 Files Created

1. **`public/gmail-onboarding-modal.html`** - Modal HTML structure with 3 onboarding steps
2. **`public/gmail-onboarding-modal.css`** - Modal styling (Google blue theme, high z-index)
3. **`public/gmail-onboarding-modal.js`** - Modal JavaScript logic with storage management
4. **`public/gmail-onboarding-integration-example.js`** - Complete integration example

## 🚀 Quick Integration

### Step 1: Copy Files to Extension

Copy these files to your Chrome extension directory:

```bash
# From backend repo
cp public/gmail-onboarding-modal.html /Users/bobbryden/gmail-ai-assistant/content/
cp public/gmail-onboarding-modal.css /Users/bobbryden/gmail-ai-assistant/content/
cp public/gmail-onboarding-modal.js /Users/bobbryden/gmail-ai-assistant/content/
```

### Step 2: Update Content Script

Add this code to your `content/gmail-content.js` (or similar):

```javascript
// ============================================================================
// ONBOARDING MODAL INTEGRATION
// ============================================================================

let onboardingModal = null;

/**
 * Inject onboarding modal HTML, CSS, and JS into Gmail
 */
function injectOnboardingModal() {
  // Check if already injected
  if (document.getElementById('gmail-ai-onboarding-modal')) {
    return;
  }

  // Inject CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = chrome.runtime.getURL('content/gmail-onboarding-modal.css');
  document.head.appendChild(cssLink);

  // Inject HTML
  fetch(chrome.runtime.getURL('content/gmail-onboarding-modal.html'))
    .then(response => response.text())
    .then(html => {
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer);

      // Inject JavaScript
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content/gmail-onboarding-modal.js');
      script.onload = function() {
        initializeOnboardingModal();
      };
      document.body.appendChild(script);
    });
}

/**
 * Initialize the onboarding modal
 */
function initializeOnboardingModal() {
  onboardingModal = new GmailAIOnboardingModal({
    storage: chrome.storage.local,
    onDismiss: () => {
      console.log('GAI: Onboarding dismissed');
    }
  });

  onboardingModal.init();
}

/**
 * Show onboarding modal if conditions are met
 * Call this when user interacts with extension UI and isn't logged in
 */
async function showOnboardingModal() {
  // Ensure modal is injected and initialized
  if (!onboardingModal) {
    injectOnboardingModal();
    setTimeout(async () => {
      if (onboardingModal) {
        const shouldShow = await onboardingModal.shouldShow();
        if (shouldShow) {
          onboardingModal.show();
        }
      }
    }, 500);
    return;
  }

  // Check if modal should be shown
  const shouldShow = await onboardingModal.shouldShow();
  if (shouldShow) {
    onboardingModal.show();
  }
}

// Initialize on Gmail load
function initGmailIntegration() {
  const checkGmailReady = setInterval(() => {
    if (document.querySelector('[role="main"]')) {
      clearInterval(checkGmailReady);
      injectOnboardingModal();
    }
  }, 500);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGmailIntegration);
} else {
  initGmailIntegration();
}
```

### Step 3: Trigger Onboarding Modal

Call `showOnboardingModal()` when user interacts with your extension UI:

```javascript
// Example: When user clicks AI Assistant button
document.addEventListener('click', async (e) => {
  // Adjust selector based on your actual UI elements
  const aiButton = e.target.closest('[data-gmail-ai-button]');
  const aiAssist = e.target.closest('[data-gmail-ai-assist]');
  
  if (aiButton || aiAssist) {
    await showOnboardingModal();
  }
});

// Example: When compose window opens with your extension UI
const composeObserver = new MutationObserver(async (mutations) => {
  const composeWindow = document.querySelector('[role="dialog"][aria-label*="Compose"]');
  if (composeWindow) {
    const extensionUI = composeWindow.querySelector('[data-gmail-ai]');
    if (extensionUI) {
      await showOnboardingModal();
    }
  }
});

composeObserver.observe(document.body, {
  childList: true,
  subtree: true
});
```

### Step 4: Update Manifest

Add the modal files to your `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Gmail AI Assistant",
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["content/gmail-content.js"],
      "css": ["content/gmail-content.css"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": [
        "content/gmail-onboarding-modal.html",
        "content/gmail-onboarding-modal.css",
        "content/gmail-onboarding-modal.js"
      ],
      "matches": ["https://mail.google.com/*"]
    }
  ]
}
```

## 🎨 Features

### Modal Behavior
- ✅ Only shows if user is **NOT logged in** AND hasn't dismissed before
- ✅ Uses `chrome.storage.local` to track `onboardingSeen` and `userLoggedIn` states
- ✅ Closes when user clicks:
  - Close button (X) in top right
  - "Got it!" button at bottom
  - Overlay background
  - Escape key
- ✅ Sets `onboardingSeen: true` when closed (won't show again)

### Styling
- ✅ Clean, modern design matching Gmail's aesthetic
- ✅ Google blue (#4285f4) for step numbers and CTA button
- ✅ High z-index (10000+) to appear above Gmail's UI
- ✅ Semi-transparent dark overlay (rgba(0, 0, 0, 0.5))
- ✅ Smooth fade-in animation
- ✅ Fully responsive (mobile-friendly)

### Onboarding Steps
1. **Step 1**: Click the extension icon in your toolbar
2. **Step 2**: Sign in with your Google account
3. **Step 3**: Start composing an email and click "AI Assist"

## 🔄 Flow Diagram

```
User interacts with extension UI
    ↓
Content script checks: showOnboardingModal()
    ↓
Check: Is user logged in?
    ↓
┌─────────────────┬─────────────────┐
│ Logged In?      │ Not Logged In?   │
│       ↓         │        ↓         │
│ Don't show      │ Check: Has seen  │
│                 │ onboarding?      │
│                 │        ↓         │
│                 │ ┌─────┬────────┐│
│                 │ │ Yes │  No    ││
│                 │ │  ↓  │   ↓    ││
│                 │ │Skip │ Show   ││
│                 │ │     │ Modal   ││
└─────────────────┴─────┴────────┘│
```

## 🧪 Testing

### Test Onboarding Display
1. Clear storage: `chrome.storage.local.clear()` in console
2. Ensure user is not logged in
3. Interact with extension UI
4. Modal should appear

### Test Dismissal
1. Click "Got it!" button
2. Interact with extension UI again
3. Modal should NOT appear (onboardingSeen = true)

### Test After Login
1. User logs in
2. Interact with extension UI
3. Modal should NOT appear (userLoggedIn = true)

### Reset for Testing
```javascript
// In browser console on Gmail page
chrome.storage.local.remove('onboardingSeen', () => {
  console.log('Onboarding reset');
});
```

## 📝 Storage Keys

The modal uses `chrome.storage.local` with these keys:

- `onboardingSeen` (boolean): Whether user has dismissed the onboarding
- `authToken` (string): User's authentication token (used to check if logged in)
- `userLoggedIn` (boolean): Explicit flag for logged in status

## 🐛 Troubleshooting

### Modal doesn't appear
1. Check browser console for errors
2. Verify files are in `web_accessible_resources`
3. Check that `injectOnboardingModal()` is being called
4. Verify `showOnboardingModal()` is being triggered

### Modal appears when it shouldn't
1. Check storage: `chrome.storage.local.get(null, console.log)`
2. Verify `onboardingSeen` is being set correctly
3. Check `userLoggedIn` or `authToken` detection

### Styling issues
1. Check CSS file is loading
2. Verify no Gmail CSS conflicts
3. Check z-index is high enough (10000+)
4. Test on different screen sizes

## ✅ Checklist

- [ ] Files copied to extension directory
- [ ] Manifest updated with web_accessible_resources
- [ ] Content script updated with integration code
- [ ] `showOnboardingModal()` called on UI interactions
- [ ] Modal appears for non-logged-in users
- [ ] Modal doesn't appear after dismissal
- [ ] Modal doesn't appear for logged-in users
- [ ] Close button works
- [ ] "Got it!" button works
- [ ] Overlay click closes modal
- [ ] Escape key closes modal
- [ ] Responsive on mobile

## 🚀 Next Steps

1. Copy files to your extension
2. Update content script with integration code
3. Update manifest.json
4. Test the flow
5. Deploy!
