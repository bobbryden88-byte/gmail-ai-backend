# 🎯 Gmail Login Modal Integration Guide

This guide shows you how to integrate the login modal directly into Gmail, so users can create accounts and login without leaving Gmail.

## 📁 Files Created

1. **`public/gmail-login-modal.html`** - Modal HTML structure
2. **`public/gmail-login-modal.css`** - Modal styling (matches Gmail design)
3. **`public/gmail-login-modal.js`** - Modal JavaScript logic

## 🚀 Integration Steps

### Step 1: Copy Files to Extension

Copy these files to your Chrome extension directory:

```bash
# From backend repo
cp public/gmail-login-modal.html /Users/bobbryden/gmail-ai-assistant/content/
cp public/gmail-login-modal.css /Users/bobbryden/gmail-ai-assistant/content/
cp public/gmail-login-modal.js /Users/bobbryden/gmail-ai-assistant/content/
```

### Step 2: Update Content Script

Update your `content/gmail-content.js` (or similar) to inject the modal:

```javascript
// At the top of your content script
let loginModal = null;

// Function to inject login modal
function injectLoginModal() {
  // Check if already injected
  if (document.getElementById('gmail-ai-login-modal')) {
    return;
  }

  // Inject CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = chrome.runtime.getURL('content/gmail-login-modal.css');
  document.head.appendChild(cssLink);

  // Inject HTML
  fetch(chrome.runtime.getURL('content/gmail-login-modal.html'))
    .then(response => response.text())
    .then(html => {
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = html;
      document.body.appendChild(modalContainer);

      // Inject JavaScript
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content/gmail-login-modal.js');
      script.onload = function() {
        // Initialize modal
        initializeLoginModal();
      };
      document.body.appendChild(script);
    });
}

// Initialize the login modal
function initializeLoginModal() {
  const apiBaseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:3000';

  loginModal = new GmailAILoginModal({
    apiBaseUrl: apiBaseUrl,
    storage: chrome.storage.sync,
    onLoginSuccess: (token, user) => {
      console.log('✅ User logged in:', user.email);
      // Hide modal and show AI assistant UI
      hideLoginModal();
      showAIAssistantUI();
    },
    onRegisterSuccess: (token, user) => {
      console.log('✅ User registered:', user.email);
      // Hide modal and show AI assistant UI
      hideLoginModal();
      showAIAssistantUI();
    }
  });

  loginModal.init();
}

// Show login modal
function showLoginModal() {
  if (loginModal) {
    loginModal.show('login');
  } else {
    // If modal not initialized, inject it first
    injectLoginModal();
    setTimeout(() => {
      if (loginModal) loginModal.show('login');
    }, 500);
  }
}

// Hide login modal
function hideLoginModal() {
  if (loginModal) {
    loginModal.hide();
  }
}

// Check authentication before showing AI features
async function checkAuthAndShowUI() {
  if (loginModal) {
    const isAuthenticated = await loginModal.checkAuth();
    
    if (isAuthenticated) {
      // User is logged in, show AI assistant
      showAIAssistantUI();
    } else {
      // User not logged in, show login modal
      showLoginModal();
    }
  } else {
    // Modal not initialized, inject it
    injectLoginModal();
    setTimeout(() => {
      checkAuthAndShowUI();
    }, 500);
  }
}

// Your existing function to show AI assistant UI
function showAIAssistantUI() {
  // Your existing code to show the compose assistant or AI panel
  // This is where your current AI assistant UI appears
  console.log('Showing AI Assistant UI');
}
```

### Step 3: Update Manifest

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
        "content/gmail-login-modal.html",
        "content/gmail-login-modal.css",
        "content/gmail-login-modal.js"
      ],
      "matches": ["https://mail.google.com/*"]
    }
  ]
}
```

### Step 4: Trigger Login Modal

Update your code to show the login modal when:

1. **User first opens compose** (before AI features):
```javascript
// In your compose button handler
function handleComposeClick() {
  checkAuthAndShowUI();
}
```

2. **User clicks AI assistant button** (if not authenticated):
```javascript
// In your AI assistant button handler
function handleAIAssistantClick() {
  checkAuthAndShowUI();
}
```

3. **On extension load** (check auth status):
```javascript
// When content script loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Gmail to load
  setTimeout(() => {
    checkAuthAndShowUI();
  }, 2000);
});
```

## 🎨 Customization

### Change API URL

Update the `apiBaseUrl` in `initializeLoginModal()`:

```javascript
const apiBaseUrl = 'https://your-production-api.com';
```

### Customize Styling

Edit `gmail-login-modal.css` to match your brand colors:

```css
.gmail-ai-button-primary {
  background-color: #your-brand-color;
}
```

### Add Google OAuth

You can add a Google OAuth button to the login form:

```html
<!-- In gmail-login-modal.html, add after the divider -->
<button type="button" class="gmail-ai-button gmail-ai-button-google" id="gmail-ai-google-login">
  <span>🔵</span> Sign in with Google
</button>
```

Then handle it in your content script:

```javascript
document.getElementById('gmail-ai-google-login').addEventListener('click', () => {
  // Your Google OAuth flow
});
```

## 🔄 Flow Diagram

```
User opens Gmail
    ↓
Content script loads
    ↓
Check authentication
    ↓
┌─────────────────┬─────────────────┐
│ Authenticated?  │ Not Authenticated│
│       ↓         │        ↓         │
│ Show AI UI      │ Show Login Modal │
│                 │        ↓         │
│                 │ User logs in     │
│                 │        ↓         │
│                 │ Show AI UI       │
└─────────────────┴─────────────────┘
```

## ✅ Testing Checklist

- [ ] Modal appears when user is not authenticated
- [ ] Login form works correctly
- [ ] Registration form works correctly
- [ ] Forgot password form works correctly
- [ ] Modal closes after successful login
- [ ] AI assistant UI appears after login
- [ ] Modal doesn't appear if user is already authenticated
- [ ] Password toggle works
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Modal is responsive on mobile
- [ ] Modal closes on Escape key
- [ ] Modal closes on overlay click

## 🐛 Troubleshooting

### Modal doesn't appear

1. Check browser console for errors
2. Verify files are in `web_accessible_resources`
3. Check that `injectLoginModal()` is being called
4. Verify API URL is correct

### Authentication not working

1. Check API endpoint is accessible
2. Verify CORS is configured correctly
3. Check browser console for network errors
4. Verify token is being saved to storage

### Styling issues

1. Check CSS file is loading
2. Verify no Gmail CSS conflicts
3. Check z-index is high enough (999999)
4. Test on different screen sizes

## 📝 Notes

- The modal uses a high z-index (999999) to appear above Gmail's UI
- The modal prevents body scroll when open
- All forms include proper validation
- Password fields have show/hide toggle
- Status messages appear for all actions
- Modal is fully responsive

## 🚀 Next Steps

1. Copy files to your extension
2. Update content script with integration code
3. Update manifest.json
4. Test the flow
5. Deploy!

