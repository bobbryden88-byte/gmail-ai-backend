/**
 * Gmail AI Assistant - Onboarding Modal Integration Example
 * 
 * This is an example of how to integrate the onboarding modal into your Gmail content script.
 * Copy relevant parts to your actual content/gmail-content.js file.
 */

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
    console.log('GAI: Onboarding modal already injected');
    return;
  }

  console.log('GAI: Injecting onboarding modal...');

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
        console.log('GAI: Onboarding modal script loaded');
        initializeOnboardingModal();
      };
      script.onerror = function() {
        console.error('GAI: Failed to load onboarding modal script');
      };
      document.body.appendChild(script);
    })
    .catch(error => {
      console.error('GAI: Error injecting onboarding modal:', error);
    });
}

/**
 * Initialize the onboarding modal
 */
function initializeOnboardingModal() {
  onboardingModal = new GmailAIOnboardingModal({
    storage: chrome.storage.local,
    onDismiss: () => {
      console.log('GAI: Onboarding modal dismissed');
    }
  });

  onboardingModal.init();
  console.log('GAI: Onboarding modal initialized');
}

/**
 * Show onboarding modal if conditions are met
 */
async function showOnboardingModal() {
  // Ensure modal is injected and initialized
  if (!onboardingModal) {
    injectOnboardingModal();
    // Wait for initialization
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

/**
 * Hide onboarding modal
 */
function hideOnboardingModal() {
  if (onboardingModal) {
    onboardingModal.hide();
  }
}

// ============================================================================
// GMAIL INTEGRATION - TRIGGER ONBOARDING
// ============================================================================

/**
 * Setup listeners for extension UI interactions
 * Call showOnboardingModal() when user interacts with extension UI
 */
function setupOnboardingTriggers() {
  // Example 1: When user clicks on AI Assistant button
  document.addEventListener('click', async (e) => {
    // Check if clicked element is part of your extension UI
    // Adjust selector based on your actual UI elements
    const aiButton = e.target.closest('[data-gmail-ai-button]');
    const aiPanel = e.target.closest('[data-gmail-ai-panel]');
    const aiAssist = e.target.closest('[data-gmail-ai-assist]');
    
    if (aiButton || aiPanel || aiAssist) {
      console.log('GAI: Extension UI clicked, checking if onboarding should show');
      await showOnboardingModal();
    }
  });

  // Example 2: When compose window opens (if you inject UI there)
  const composeObserver = new MutationObserver(async (mutations) => {
    const composeWindow = document.querySelector('[role="dialog"][aria-label*="Compose"]');
    if (composeWindow) {
      // Check if your extension UI is present in compose
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

  // Example 3: When AI panel is toggled (if you have a toggle)
  document.addEventListener('keydown', async (e) => {
    // Example: Alt+Shift+A toggles AI panel
    if (e.altKey && e.shiftKey && e.key === 'A') {
      await showOnboardingModal();
    }
  });
}

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
      
      // Inject onboarding modal
      injectOnboardingModal();
      
      // Setup triggers for showing onboarding
      setTimeout(() => {
        setupOnboardingTriggers();
      }, 1000);
    }
  }, 500);
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
    // Re-inject if needed on navigation
    setTimeout(() => {
      if (!document.getElementById('gmail-ai-onboarding-modal')) {
        injectOnboardingModal();
      }
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

// Make functions available for testing
if (typeof window !== 'undefined') {
  window.GmailAIOnboardingIntegration = {
    showOnboardingModal,
    hideOnboardingModal,
    injectOnboardingModal,
    initializeOnboardingModal
  };
}
