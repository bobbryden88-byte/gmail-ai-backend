/**
 * Gmail AI Assistant - Onboarding Modal JavaScript
 * Handles onboarding flow for new users within Gmail
 * 
 * Usage:
 * 1. Inject this script and CSS into Gmail via content script
 * 2. Call GmailAIOnboardingModal.show() to display the modal
 * 3. Call GmailAIOnboardingModal.hide() to hide the modal
 * 4. Call GmailAIOnboardingModal.shouldShow() to check if modal should be displayed
 */

class GmailAIOnboardingModal {
  constructor(config = {}) {
    this.storage = config.storage || (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null);
    this.onDismiss = config.onDismiss || null;
    
    this.modal = null;
    this.isInitialized = false;
    
    // Bind methods
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.shouldShow = this.shouldShow.bind(this);
  }

  /**
   * Initialize the modal (call this after DOM is ready)
   */
  init() {
    // Always re-fetch modal in case DOM changed
    this.modal = document.getElementById('gmail-ai-onboarding-modal');
    if (!this.modal) {
      console.error('GmailAIOnboardingModal: Modal HTML not found. Make sure gmail-onboarding-modal.html is injected first.');
      return;
    }

    // Setup event listeners (will skip if already initialized)
    if (!this.isInitialized) {
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('GmailAIOnboardingModal: Initialized');
    } else {
      // Re-setup listeners in case modal was re-injected
      console.log('GmailAIOnboardingModal: Re-setting up event listeners');
      this.setupEventListeners();
    }
  }

  /**
   * Setup event listeners for the modal
   */
  setupEventListeners() {
    if (!this.modal) {
      console.error('GmailAIOnboardingModal: Cannot setup event listeners - modal not found');
      return;
    }

    // Store reference to this for use in event handlers
    const self = this;

    // Use event delegation on the modal itself for maximum reliability
    this.modal.addEventListener('click', function(e) {
      // Close button clicked
      if (e.target.id === 'gmail-ai-onboarding-close' || e.target.closest('#gmail-ai-onboarding-close')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('GAI: Close button clicked (delegation)');
        self.hide();
        return false;
      }
      
      // Got it button clicked
      if (e.target.id === 'gmail-ai-onboarding-got-it' || e.target.closest('#gmail-ai-onboarding-got-it')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('GAI: Got it button clicked (delegation)');
        self.hide();
        return false;
      }
      
      // Overlay clicked (but not modal card)
      if (e.target.classList.contains('gmail-ai-onboarding-overlay')) {
        console.log('GAI: Overlay clicked (delegation)');
        self.hide();
        return false;
      }
    }, true); // Use capture phase

    // Also add direct listeners as backup
    const closeBtn = document.getElementById('gmail-ai-onboarding-close');
    if (closeBtn) {
      // Remove and re-add to ensure clean state
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      
      newCloseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('GAI: Close button clicked (direct)');
        self.hide();
        return false;
      }, true);
      
      newCloseBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('GAI: Close button clicked (onclick)');
        self.hide();
        return false;
      };
      
      console.log('GAI: Close button event listeners attached');
    } else {
      console.error('GAI: Close button not found in DOM');
    }

    // "Got it!" button
    const gotItBtn = document.getElementById('gmail-ai-onboarding-got-it');
    if (gotItBtn) {
      const newGotItBtn = gotItBtn.cloneNode(true);
      gotItBtn.parentNode.replaceChild(newGotItBtn, gotItBtn);
      
      newGotItBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('GAI: Got it button clicked (direct)');
        self.hide();
        return false;
      }, true);
      
      newGotItBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('GAI: Got it button clicked (onclick)');
        self.hide();
        return false;
      };
      
      console.log('GAI: Got it button event listeners attached');
    } else {
      console.error('GAI: Got it button not found in DOM');
    }

    // Close on Escape key
    this.escapeKeyHandler = function(e) {
      if (e.key === 'Escape' && self.modal && self.modal.style.display !== 'none' && self.modal.style.display !== '') {
        console.log('GAI: Escape key pressed');
        self.hide();
      }
    };
    document.addEventListener('keydown', this.escapeKeyHandler, true);
    console.log('GAI: Escape key listener attached');
  }

  /**
   * Show the modal
   */
  show() {
    if (!this.isInitialized) {
      this.init();
    }
    
    // Re-fetch modal in case DOM changed
    this.modal = document.getElementById('gmail-ai-onboarding-modal');
    
    if (!this.modal) {
      console.error('GmailAIOnboardingModal: Modal not found');
      return;
    }

    // Ensure event listeners are attached (in case modal was re-injected)
    if (!this.isInitialized) {
      this.setupEventListeners();
      this.isInitialized = true;
    }

    this.modal.style.setProperty('display', 'flex', 'important');
    document.body.classList.add('gmail-ai-onboarding-open');
    console.log('GAI: Modal shown');
  }

  /**
   * Hide the modal and mark as seen
   */
  async hide() {
    console.log('GAI: hide() called');
    
    // Re-fetch modal in case DOM changed
    if (!this.modal) {
      this.modal = document.getElementById('gmail-ai-onboarding-modal');
    }
    
    if (!this.modal) {
      console.warn('GAI: Cannot hide modal - not found in DOM');
      // Try one more time with direct query
      const modalEl = document.getElementById('gmail-ai-onboarding-modal');
      if (modalEl) {
        console.log('GAI: Found modal on second try, hiding directly');
        modalEl.style.setProperty('display', 'none', 'important');
        document.body.classList.remove('gmail-ai-onboarding-open');
        await this.markOnboardingSeen();
      }
      return;
    }

    console.log('GAI: Hiding onboarding modal');
    
    // Force hide with multiple methods
    this.modal.style.setProperty('display', 'none', 'important');
    this.modal.style.display = 'none';
    this.modal.setAttribute('style', 'display: none !important;');
    document.body.classList.remove('gmail-ai-onboarding-open');

    // Mark onboarding as seen
    try {
      await this.markOnboardingSeen();
      console.log('GAI: Onboarding marked as seen');
    } catch (error) {
      console.error('GAI: Error marking onboarding as seen:', error);
      // Fallback to sync storage
      try {
        chrome.storage.local.set({ onboardingSeen: true });
      } catch (e) {
        console.error('GAI: Fallback storage also failed:', e);
      }
    }

    // Call dismiss callback if provided
    if (this.onDismiss) {
      try {
        this.onDismiss();
      } catch (error) {
        console.error('GAI: Error in onDismiss callback:', error);
      }
    }
    
    // Verify it's actually hidden
    setTimeout(() => {
      const computedDisplay = window.getComputedStyle(this.modal).display;
      if (computedDisplay !== 'none') {
        console.warn('GAI: Modal still visible, forcing hide again');
        this.modal.style.setProperty('display', 'none', 'important');
      }
    }, 50);
    
    console.log('GAI: Modal hidden successfully');
  }

  /**
   * Check if user is logged in
   * Checks both chrome.storage.sync (for userToken) and chrome.storage.local (for userLoggedIn)
   */
  async isUserLoggedIn() {
    // First check chrome.storage.sync for userToken (used by auth system)
    return new Promise((resolve) => {
      chrome.storage.sync.get(['userToken'], (syncResult) => {
        if (chrome.runtime.lastError) {
          console.error('GAI: Error checking sync storage:', chrome.runtime.lastError);
          resolve(false);
          return;
        }
        
        if (syncResult.userToken) {
          resolve(true);
          return;
        }
        
        // Also check chrome.storage.local for userLoggedIn flag
        chrome.storage.local.get(['userLoggedIn'], (localResult) => {
          if (chrome.runtime.lastError) {
            console.error('GAI: Error checking local storage:', chrome.runtime.lastError);
            resolve(false);
            return;
          }
          
          resolve(!!localResult.userLoggedIn);
        });
      });
    });
  }

  /**
   * Check if onboarding has been seen before
   */
  async hasSeenOnboarding() {
    if (this.storage) {
      return new Promise((resolve) => {
        this.storage.get(['onboardingSeen'], (result) => {
          resolve(!!result.onboardingSeen);
        });
      });
    } else {
      // Fallback to localStorage
      return !!localStorage.getItem('gmail-ai-onboardingSeen');
    }
  }

  /**
   * Check if modal should be shown
   * Returns true if user is NOT logged in AND hasn't seen onboarding before
   */
  async shouldShow() {
    const isLoggedIn = await this.isUserLoggedIn();
    const hasSeen = await this.hasSeenOnboarding();
    
    return !isLoggedIn && !hasSeen;
  }

  /**
   * Mark onboarding as seen
   */
  async markOnboardingSeen() {
    if (this.storage) {
      return new Promise((resolve) => {
        this.storage.set({ onboardingSeen: true }, resolve);
      });
    } else {
      // Fallback to localStorage
      localStorage.setItem('gmail-ai-onboardingSeen', 'true');
    }
  }

  /**
   * Reset onboarding (for testing purposes)
   */
  async reset() {
    if (this.storage) {
      return new Promise((resolve) => {
        this.storage.remove('onboardingSeen', resolve);
      });
    } else {
      // Fallback to localStorage
      localStorage.removeItem('gmail-ai-onboardingSeen');
    }
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GmailAIOnboardingModal;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.GmailAIOnboardingModal = GmailAIOnboardingModal;
}
