// Login Page JavaScript
// External file to comply with Content Security Policy

console.log('🔍 Login page JavaScript loaded');

(function() {
  const form = document.getElementById('login-form');
  const status = document.getElementById('status');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const submitBtn = document.getElementById('submitBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const registerLink = document.getElementById('registerLink');
  
  // Show/hide password toggle
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passwordToggle.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }
  
  // Update forgot password link to show forgot password form
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForgotPasswordForm();
    });
  }
  
  // Handle register link
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterForm();
    });
  }
  
  function showStatus(message, type = 'info') {
    console.log('Status:', type, message);
    if (status) {
      status.textContent = message;
      status.className = `status ${type}`;
      status.style.display = 'block';
      
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          status.style.display = 'none';
        }, 5000);
      }
    }
  }
  
  function showForgotPasswordForm() {
    // Hide login form
    if (form) form.style.display = 'none';
    
    // Create forgot password form
    const container = document.querySelector('.container');
    const existingForgotForm = document.getElementById('forgot-password-form');
    
    if (existingForgotForm) {
      existingForgotForm.style.display = 'block';
      return;
    }
    
    const forgotForm = document.createElement('form');
    forgotForm.id = 'forgot-password-form';
    forgotForm.innerHTML = `
      <div class="icon">📧</div>
      <h1>Reset Password</h1>
      <p class="subtitle">Enter your email to receive a password reset link</p>
      
      <div id="forgot-status" class="status"></div>
      
      <div class="form-group">
        <label for="forgot-email">Email Address</label>
        <input 
          type="email" 
          id="forgot-email" 
          name="email" 
          placeholder="Enter your email" 
          required 
          autocomplete="email"
        >
      </div>
      
      <button type="submit" class="btn" id="forgot-submit-btn">Send Reset Link</button>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="#" id="back-to-login" style="color: #667eea; text-decoration: none; font-size: 14px;">← Back to Login</a>
      </div>
    `;
    
    container.appendChild(forgotForm);
    
    // Handle back to login
    document.getElementById('back-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      forgotForm.style.display = 'none';
      if (form) form.style.display = 'block';
    });
    
    // Handle forgot password form submission
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('forgot-email').value;
      const forgotSubmitBtn = document.getElementById('forgot-submit-btn');
      const forgotStatus = document.getElementById('forgot-status');
      
      if (!email) {
        showForgotStatus('Please enter your email address', 'error', forgotStatus);
        return;
      }
      
      forgotSubmitBtn.disabled = true;
      forgotSubmitBtn.textContent = 'Sending...';
      
      try {
        const response = await fetch(`${window.location.origin}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
          showForgotStatus('✅ Password reset link sent! Check your email.', 'success', forgotStatus);
          forgotForm.querySelector('input').value = '';
        } else {
          showForgotStatus(`❌ ${data.error || 'Failed to send reset link'}`, 'error', forgotStatus);
        }
      } catch (error) {
        console.error('Error sending reset link:', error);
        showForgotStatus(`❌ Failed to send reset link: ${error.message}`, 'error', forgotStatus);
      } finally {
        forgotSubmitBtn.disabled = false;
        forgotSubmitBtn.textContent = 'Send Reset Link';
      }
    });
  }
  
  function showForgotStatus(message, type, statusElement) {
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status ${type}`;
      statusElement.style.display = 'block';
    }
  }
  
  function showRegisterForm() {
    // Hide login form
    if (form) form.style.display = 'none';
    
    // Create register form
    const container = document.querySelector('.container');
    const existingRegisterForm = document.getElementById('register-form');
    
    if (existingRegisterForm) {
      existingRegisterForm.style.display = 'block';
      return;
    }
    
    const registerForm = document.createElement('form');
    registerForm.id = 'register-form';
    registerForm.innerHTML = `
      <div class="icon">✨</div>
      <h1>Create Account</h1>
      <p class="subtitle">Sign up for Gmail AI Assistant</p>
      
      <div id="register-status" class="status"></div>
      
      <div class="form-group">
        <label for="register-name">Full Name</label>
        <input 
          type="text" 
          id="register-name" 
          name="name" 
          placeholder="Enter your name" 
          autocomplete="name"
        >
      </div>
      
      <div class="form-group">
        <label for="register-email">Email Address</label>
        <input 
          type="email" 
          id="register-email" 
          name="email" 
          placeholder="Enter your email" 
          required 
          autocomplete="email"
        >
      </div>
      
      <div class="form-group">
        <label for="register-password">Password</label>
        <input 
          type="password" 
          id="register-password" 
          name="password" 
          placeholder="Create a password (min 6 characters)" 
          required 
          autocomplete="new-password"
          minlength="6"
        >
        <div class="requirements" style="font-size: 12px; color: #666; margin-top: 8px;">Minimum 6 characters</div>
      </div>
      
      <button type="submit" class="btn" id="register-submit-btn">Create Account</button>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="#" id="back-to-login-from-register" style="color: #667eea; text-decoration: none; font-size: 14px;">← Back to Login</a>
      </div>
    `;
    
    container.appendChild(registerForm);
    
    // Handle back to login
    document.getElementById('back-to-login-from-register').addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.style.display = 'none';
      if (form) form.style.display = 'block';
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const registerSubmitBtn = document.getElementById('register-submit-btn');
      const registerStatus = document.getElementById('register-status');
      
      if (!email || !password) {
        showRegisterStatus('Email and password are required', 'error', registerStatus);
        return;
      }
      
      if (password.length < 6) {
        showRegisterStatus('Password must be at least 6 characters', 'error', registerStatus);
        return;
      }
      
      registerSubmitBtn.disabled = true;
      registerSubmitBtn.textContent = 'Creating Account...';
      
      try {
        const response = await fetch(`${window.location.origin}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password })
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
          // Store token and user data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Check if user needs to add payment method (card-on-file trial)
          if (data.requiresPayment && data.checkoutUrl) {
            showRegisterStatus('✅ Account created! Redirecting to start your 30-day free trial...', 'success', registerStatus);
            
            setTimeout(() => {
              // Redirect to Stripe Checkout for card collection
              window.location.href = data.checkoutUrl;
            }, 1500);
            return;
          }
          
          showRegisterStatus('✅ Account created successfully! Redirecting...', 'success', registerStatus);
          
          setTimeout(() => {
            // Redirect to extension or show success message
            window.location.href = '/login.html?registered=true';
          }, 2000);
        } else {
          showRegisterStatus(`❌ ${data.error || 'Failed to create account'}`, 'error', registerStatus);
        }
      } catch (error) {
        console.error('Error registering:', error);
        showRegisterStatus(`❌ Failed to create account: ${error.message}`, 'error', registerStatus);
      } finally {
        registerSubmitBtn.disabled = false;
        registerSubmitBtn.textContent = 'Create Account';
      }
    });
  }
  
  function showRegisterStatus(message, type, statusElement) {
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status ${type}`;
      statusElement.style.display = 'block';
    }
  }
  
  // Handle login form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (!email || !password) {
        showStatus('Please enter both email and password', 'error');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing In...';
      
      try {
        console.log('📡 Sending login request...');
        const response = await fetch(`${window.location.origin}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.token) {
          console.log('✅ Login successful!');
          
          // Store token and user data
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Check if user needs to add payment method (card-on-file trial)
          if (data.requiresPayment && data.checkoutUrl) {
            showStatus('✅ Signed in! Redirecting to add payment method...', 'success');
            
            setTimeout(() => {
              // Redirect to Stripe Checkout for card collection
              window.location.href = data.checkoutUrl;
            }, 1500);
            return;
          }
          
          showStatus('✅ Login successful! Redirecting...', 'success');
          
          // Check if there's a redirect parameter
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          
          setTimeout(() => {
            if (redirect) {
              window.location.href = redirect;
            } else {
              // Default: close window if opened from extension, or show success
              if (window.opener) {
                window.close();
              } else {
                showStatus('✅ Login successful! You can now use the extension.', 'success');
              }
            }
          }, 1500);
        } else {
          console.error('❌ Login failed:', data.error);
          showStatus(`❌ ${data.error || 'Invalid email or password'}`, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      } catch (error) {
        console.error('❌ Error logging in:', error);
        showStatus(`❌ Failed to login: ${error.message}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }
  
  // Check if user was redirected after registration
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    showStatus('✅ Account created successfully! Please sign in.', 'success');
  }
})();

