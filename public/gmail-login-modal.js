/**
 * Gmail Login Modal JavaScript
 * Handles authentication flow within Gmail
 * 
 * Usage:
 * 1. Inject this script and CSS into Gmail via content script
 * 2. Call GmailAILoginModal.show() to display the modal
 * 3. Call GmailAILoginModal.hide() to hide the modal
 * 4. Call GmailAILoginModal.checkAuth() to check if user is authenticated
 */

class GmailAILoginModal {
  constructor(config = {}) {
    this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3000';
    this.onLoginSuccess = config.onLoginSuccess || null;
    this.onRegisterSuccess = config.onRegisterSuccess || null;
    this.storage = config.storage || (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.sync : null);
    
    this.modal = null;
    this.currentView = 'login'; // 'login', 'register', 'forgot'
    this.isInitialized = false;
    
    // Bind methods
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
  }

  /**
   * Initialize the modal (call this after DOM is ready)
   */
  init() {
    if (this.isInitialized) return;
    
    // Check if modal already exists
    this.modal = document.getElementById('gmail-ai-login-modal');
    if (!this.modal) {
      console.error('GmailAILoginModal: Modal HTML not found. Make sure gmail-login-modal.html is injected first.');
      return;
    }

    this.setupEventListeners();
    this.isInitialized = true;
    console.log('GmailAILoginModal: Initialized');
  }

  /**
   * Setup event listeners for the modal
   */
  setupEventListeners() {
    // Close button
    const closeBtn = document.getElementById('gmail-ai-login-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display !== 'none') {
        this.hide();
      }
    });

    // Login form
    const loginForm = document.getElementById('gmail-ai-login-form-element');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('gmail-ai-register-form-element');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Forgot password form
    const forgotForm = document.getElementById('gmail-ai-forgot-form-element');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
    }

    // View switchers
    const showRegisterBtn = document.getElementById('gmail-ai-show-register');
    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', () => this.showView('register'));
    }

    const showLoginBtn = document.getElementById('gmail-ai-show-login');
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => this.showView('login'));
    }

    const showForgotBtn = document.getElementById('gmail-ai-show-forgot-password');
    if (showForgotBtn) {
      showForgotBtn.addEventListener('click', () => this.showView('forgot'));
    }

    const backToLoginBtn = document.getElementById('gmail-ai-back-to-login');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => this.showView('login'));
    }

    // Password toggles
    this.setupPasswordToggles();
  }

  /**
   * Setup password visibility toggles
   */
  setupPasswordToggles() {
    const loginToggle = document.getElementById('gmail-ai-login-password-toggle');
    const loginPassword = document.getElementById('gmail-ai-login-password');
    if (loginToggle && loginPassword) {
      loginToggle.addEventListener('click', () => {
        const type = loginPassword.type === 'password' ? 'text' : 'password';
        loginPassword.type = type;
        loginToggle.textContent = type === 'password' ? '👁️' : '🙈';
      });
    }

    const registerToggle = document.getElementById('gmail-ai-register-password-toggle');
    const registerPassword = document.getElementById('gmail-ai-register-password');
    if (registerToggle && registerPassword) {
      registerToggle.addEventListener('click', () => {
        const type = registerPassword.type === 'password' ? 'text' : 'password';
        registerPassword.type = type;
        registerToggle.textContent = type === 'password' ? '👁️' : '🙈';
      });
    }
  }

  /**
   * Show the modal
   */
  show(view = 'login') {
    if (!this.isInitialized) {
      this.init();
    }
    
    if (!this.modal) {
      console.error('GmailAILoginModal: Modal not found');
      return;
    }

    this.showView(view);
    this.modal.style.display = 'flex';
    document.body.classList.add('gmail-ai-modal-open');
  }

  /**
   * Hide the modal
   */
  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.classList.remove('gmail-ai-modal-open');
    }
  }

  /**
   * Show a specific view (login, register, forgot)
   */
  showView(view) {
    this.currentView = view;

    // Hide all forms
    const forms = ['login', 'register', 'forgot'];
    forms.forEach(form => {
      const formEl = document.getElementById(`gmail-ai-${form}-form`);
      if (formEl) formEl.style.display = 'none';
    });

    // Show selected form
    const selectedForm = document.getElementById(`gmail-ai-${view}-form`);
    if (selectedForm) {
      selectedForm.style.display = 'block';
    }

    // Clear status messages
    this.clearStatusMessages();
  }

  /**
   * Handle login form submission
   */
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('gmail-ai-login-email').value;
    const password = document.getElementById('gmail-ai-login-password').value;
    const submitBtn = document.getElementById('gmail-ai-login-submit');

    if (!email || !password) {
      this.showStatus('login', 'Please enter both email and password', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Store token
        await this.saveAuthData(data.token, data.user);
        
        // Check if user needs to add payment method (card-on-file trial)
        if (data.requiresPayment && data.checkoutUrl) {
          this.showStatus('login', '✅ Signed in! Redirecting to add payment method...', 'success');
          
          // Redirect to Stripe Checkout for card collection
          setTimeout(() => {
            this.hide();
            this.redirectToCheckout(data.checkoutUrl);
          }, 1500);
          return;
        }
        
        this.showStatus('login', '✅ Login successful!', 'success');
        
        // Call success callback
        if (this.onLoginSuccess) {
          setTimeout(() => {
            this.onLoginSuccess(data.token, data.user);
            this.hide();
          }, 1000);
        } else {
          setTimeout(() => this.hide(), 1500);
        }
      } else {
        this.showStatus('login', `❌ ${data.error || 'Invalid email or password'}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showStatus('login', `❌ Failed to login: ${error.message}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }

  /**
   * Handle register form submission
   */
  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('gmail-ai-register-name').value;
    const email = document.getElementById('gmail-ai-register-email').value;
    const password = document.getElementById('gmail-ai-register-password').value;
    const submitBtn = document.getElementById('gmail-ai-register-submit');

    if (!email || !password) {
      this.showStatus('register', 'Email and password are required', 'error');
      return;
    }

    if (password.length < 6) {
      this.showStatus('register', 'Password must be at least 6 characters', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Store token
        await this.saveAuthData(data.token, data.user);
        
        // Check if user needs to add payment method (card-on-file trial)
        if (data.requiresPayment && data.checkoutUrl) {
          this.showStatus('register', '✅ Account created! Redirecting to start your 30-day free trial...', 'success');
          
          // Redirect to Stripe Checkout for card collection
          setTimeout(() => {
            this.hide();
            this.redirectToCheckout(data.checkoutUrl);
          }, 1500);
          return;
        }
        
        this.showStatus('register', '✅ Account created successfully!', 'success');
        
        // Call success callback
        if (this.onRegisterSuccess) {
          setTimeout(() => {
            this.onRegisterSuccess(data.token, data.user);
            this.hide();
          }, 1000);
        } else {
          setTimeout(() => this.hide(), 1500);
        }
      } else {
        this.showStatus('register', `❌ ${data.error || 'Failed to create account'}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    } catch (error) {
      console.error('Register error:', error);
      this.showStatus('register', `❌ Failed to create account: ${error.message}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }

  /**
   * Handle forgot password form submission
   */
  async handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('gmail-ai-forgot-email').value;
    const submitBtn = document.getElementById('gmail-ai-forgot-submit');

    if (!email) {
      this.showStatus('forgot', 'Please enter your email address', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        this.showStatus('forgot', '✅ Password reset link sent! Check your email.', 'success');
        document.getElementById('gmail-ai-forgot-email').value = '';
      } else {
        this.showStatus('forgot', `❌ ${data.error || 'Failed to send reset link'}`, 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      this.showStatus('forgot', `❌ Failed to send reset link: ${error.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';
    }
  }

  /**
   * Show status message
   */
  showStatus(view, message, type = 'info') {
    const statusEl = document.getElementById(`gmail-ai-${view}-status`);
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `gmail-ai-status-message ${type}`;
      statusEl.style.display = 'block';
    }
  }

  /**
   * Clear all status messages
   */
  clearStatusMessages() {
    ['login', 'register', 'forgot'].forEach(view => {
      const statusEl = document.getElementById(`gmail-ai-${view}-status`);
      if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
      }
    });
  }

  /**
   * Save authentication data to storage
   */
  async saveAuthData(token, user) {
    if (this.storage) {
      return new Promise((resolve) => {
        this.storage.set({
          authToken: token,
          user: JSON.stringify(user),
          userId: user.id,
          userEmail: user.email,
          isPremium: user.isPremium || false
        }, resolve);
      });
    } else {
      // Fallback to localStorage
      localStorage.setItem('gmail-ai-authToken', token);
      localStorage.setItem('gmail-ai-user', JSON.stringify(user));
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth() {
    if (this.storage) {
      return new Promise((resolve) => {
        this.storage.get(['authToken'], (result) => {
          resolve(!!result.authToken);
        });
      });
    } else {
      return !!localStorage.getItem('gmail-ai-authToken');
    }
  }

  /**
   * Get auth token
   */
  async getAuthToken() {
    if (this.storage) {
      return new Promise((resolve) => {
        this.storage.get(['authToken'], (result) => {
          resolve(result.authToken || null);
        });
      });
    } else {
      return localStorage.getItem('gmail-ai-authToken');
    }
  }

  /**
   * Redirect to Stripe Checkout for card collection
   * Uses chrome.tabs.create in extension context, window.open otherwise
   */
  redirectToCheckout(checkoutUrl) {
    console.log('Redirecting to Stripe Checkout:', checkoutUrl);
    
    // Check if we're in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      // Extension context - open in new tab
      chrome.tabs.create({ url: checkoutUrl });
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      // Content script context - send message to background to open tab
      chrome.runtime.sendMessage({ 
        action: 'OPEN_CHECKOUT_TAB', 
        url: checkoutUrl 
      });
    } else {
      // Web context - use window.open
      window.open(checkoutUrl, '_blank');
    }
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GmailAILoginModal;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.GmailAILoginModal = GmailAILoginModal;
}

