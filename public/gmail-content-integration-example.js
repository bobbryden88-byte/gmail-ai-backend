/**
 * Example Content Script Integration
 * 
 * This is an example of how to integrate the login modal into your Gmail content script.
 * Copy relevant parts to your actual content/gmail-content.js file.
 */

// ============================================================================
// LOGIN MODAL INTEGRATION
// ============================================================================

let loginModal = null;
let isAuthenticated = false;

/**
 * Inject login modal HTML, CSS, and JS into Gmail
 */
function injectLoginModal() {
  // Check if already injected
  if (document.getElementById('gmail-ai-login-modal')) {
    console.log('GAI: Login modal already injected');
    return;
  }

  console.log('GAI: Injecting login modal...');

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
        console.log('GAI: Login modal script loaded');
        initializeLoginModal();
      };
      script.onerror = function() {
        console.error('GAI: Failed to load login modal script');
      };
      document.body.appendChild(script);
    })
    .catch(error => {
      console.error('GAI: Error injecting login modal:', error);
    });
}

/**
 * Initialize the login modal
 */
function initializeLoginModal() {
  // Get API base URL from environment or config
  const apiBaseUrl = getApiBaseUrl();

  loginModal = new GmailAILoginModal({
    apiBaseUrl: apiBaseUrl,
    storage: chrome.storage.sync,
    onLoginSuccess: (token, user) => {
      console.log('GAI: ✅ User logged in:', user.email);
      isAuthenticated = true;
      hideLoginModal();
      showAIAssistantUI();
      // Optionally refresh user data
      refreshUserData();
    },
    onRegisterSuccess: (token, user) => {
      console.log('GAI: ✅ User registered:', user.email);
      isAuthenticated = true;
      hideLoginModal();
      showAIAssistantUI();
      // Optionally refresh user data
      refreshUserData();
    }
  });

  loginModal.init();
  console.log('GAI: Login modal initialized');
}

/**
 * Get API base URL
 */
function getApiBaseUrl() {
  // Check if we have a stored API URL
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiBaseUrl'], (result) => {
      const url = result.apiBaseUrl || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://your-api-domain.com' 
                    : 'http://localhost:3000');
      resolve(url);
    });
  });
}

/**
 * Show login modal
 */
function showLoginModal(view = 'login') {
  if (loginModal) {
    loginModal.show(view);
  } else {
    // If modal not initialized, inject it first
    injectLoginModal();
    setTimeout(() => {
      if (loginModal) {
        loginModal.show(view);
      }
    }, 500);
  }
}

/**
 * Hide login modal
 */
function hideLoginModal() {
  if (loginModal) {
    loginModal.hide();
  }
}

/**
 * Check if user is authenticated
 */
async function checkAuthentication() {
  if (loginModal) {
    isAuthenticated = await loginModal.checkAuth();
    return isAuthenticated;
  }
  
  // Fallback: check storage directly
  return new Promise((resolve) => {
    chrome.storage.sync.get(['authToken'], (result) => {
      isAuthenticated = !!result.authToken;
      resolve(isAuthenticated);
    });
  });
}

/**
 * Check auth and show appropriate UI
 */
async function checkAuthAndShowUI() {
  const authenticated = await checkAuthentication();
  
  if (authenticated) {
    // User is logged in, show AI assistant
    console.log('GAI: User authenticated, showing AI assistant');
    showAIAssistantUI();
  } else {
    // User not logged in, show login modal
    console.log('GAI: User not authenticated, showing login modal');
    showLoginModal('login');
  }
}

/**
 * Show AI Assistant UI (your existing function)
 */
function showAIAssistantUI() {
  // TODO: Replace with your actual AI assistant UI code
  console.log('GAI: Showing AI Assistant UI');
  
  // Example: Show your compose assistant panel
  // showComposeAssistant();
  
  // Example: Show AI response panel
  // showAIResponsePanel();
}

/**
 * Refresh user data after login
 */
function refreshUserData() {
  // TODO: Fetch fresh user data from API
  // This ensures premium status, usage limits, etc. are up to date
  console.log('GAI: Refreshing user data...');
}

// ============================================================================
// GMAIL INTEGRATION
// ============================================================================

/**
 * Initialize Gmail integration
 */
function initGmailIntegration() {
  console.log('GAI: Initializing Gmail integration...');
  
  // Wait for Gmail to fully load
  const checkGmailReady = setInterval(() => {
    if (document.querySelector('[role="main"]')) {
      clearInterval(checkGmailReady);
      console.log('GAI: Gmail loaded');
      
      // Inject login modal
      injectLoginModal();
      
      // Check authentication status
      setTimeout(() => {
        checkAuthAndShowUI();
      }, 1000);
      
      // Setup compose button listener
      setupComposeListener();
      
      // Setup email view listener
      setupEmailViewListener();
    }
  }, 500);
}

/**
 * Setup compose button listener
 */
function setupComposeListener() {
  // Listen for compose button clicks
  document.addEventListener('click', (e) => {
    // Check if compose button was clicked
    const composeButton = e.target.closest('[role="button"][data-tooltip*="Compose"]');
    if (composeButton) {
      console.log('GAI: Compose button clicked');
      // Check auth before showing AI features
      checkAuthAndShowUI();
    }
  });
}

/**
 * Setup email view listener
 */
function setupEmailViewListener() {
  // Listen for email opens
  const observer = new MutationObserver((mutations) => {
    // Check if an email thread is open
    const emailThread = document.querySelector('[role="main"] [role="article"]');
    if (emailThread) {
      // Check auth before showing AI features
      checkAuthAndShowUI();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Setup AI Assistant button (if you have one)
 */
function setupAIAssistantButton() {
  // Create AI Assistant button
  const aiButton = document.createElement('button');
  aiButton.textContent = 'AI Assistant';
  aiButton.className = 'gmail-ai-assistant-button';
  aiButton.addEventListener('click', () => {
    checkAuthAndShowUI();
  });
  
  // Insert button into Gmail UI
  // TODO: Adjust selector based on your Gmail UI structure
  const toolbar = document.querySelector('[role="toolbar"]');
  if (toolbar) {
    toolbar.appendChild(aiButton);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGmailIntegration);
} else {
  initGmailIntegration();
}

// Also run when Gmail navigates (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('GAI: Gmail navigation detected');
    // Re-check auth on navigation
    setTimeout(() => {
      checkAuthAndShowUI();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

// Make functions available for testing
if (typeof window !== 'undefined') {
  window.GmailAIContentScript = {
    showLoginModal,
    hideLoginModal,
    checkAuthentication,
    checkAuthAndShowUI,
    showAIAssistantUI
  };
}

