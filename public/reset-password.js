// Reset Password Page JavaScript
// External file to comply with Content Security Policy

console.log('🔍 Reset password page JavaScript loaded');

(async function() {
  console.log('Current URL:', window.location.href);
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const form = document.getElementById('reset-form');
  const loading = document.getElementById('loading');
  const status = document.getElementById('status');
  
  console.log('Token from URL:', token ? token.substring(0, 20) + '...' : 'MISSING');
  
  function showStatus(message, type = 'info') {
    console.log('Status:', type, message);
    if (status) {
      status.textContent = message;
      status.className = `status ${type}`;
      status.style.display = 'block';
    }
  }
  
  // Verify token
  if (!token) {
    console.error('❌ No token in URL');
    if (loading) loading.style.display = 'none';
    showStatus('❌ No reset token provided. Please use the link from your email.', 'error');
    return;
  }
  
  console.log('✅ Token found, verifying with backend...');
  
  // Add timeout to prevent infinite loading
  const timeout = setTimeout(() => {
    console.error('⏱️ Request timed out after 10 seconds');
    if (loading) loading.style.display = 'none';
    showStatus('❌ Request timed out. Backend may not be running. Please check if the server is running and try again.', 'error');
    
    // Show form anyway after timeout (risky but better UX)
    if (form) form.style.display = 'block';
    showStatus('⚠️ Could not verify token. You can try resetting anyway, or request a new link.', 'error');
  }, 10000); // 10 second timeout
  
  try {
    const apiUrl = `${window.location.origin}/api/auth/verify-reset-token?token=${token}`;
    console.log('📡 Calling:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('✅ Response received');
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    clearTimeout(timeout); // Clear timeout on successful response
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (loading) loading.style.display = 'none';
    
    if (data.valid) {
      console.log('✅ Token is valid, showing form');
      if (form) form.style.display = 'block';
      showStatus(`✅ Token verified for ${data.email}`, 'success');
    } else {
      console.log('❌ Token invalid:', data.message);
      showStatus(`❌ ${data.message}. Please request a new password reset.`, 'error');
    }
  } catch (error) {
    clearTimeout(timeout); // Clear timeout on error
    console.error('❌ Error verifying token:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (loading) loading.style.display = 'none';
    showStatus(`❌ Network error: ${error.message}. Backend may not be running.`, 'error');
    
    // Show form anyway on error (user can still try)
    if (form) form.style.display = 'block';
  }
  
  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      console.log('📝 Form submitted');
      
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitBtn = document.getElementById('submitBtn');
      
      console.log('Password length:', newPassword.length);
      console.log('Passwords match:', newPassword === confirmPassword);
      
      if (newPassword !== confirmPassword) {
        showStatus('❌ Passwords do not match', 'error');
        return;
      }
      
      if (newPassword.length < 6) {
        showStatus('❌ Password must be at least 6 characters', 'error');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Resetting...';
      
      try {
        console.log('📡 Sending password reset request...');
        const response = await fetch(`${window.location.origin}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          console.log('✅ Password reset successful!');
          showStatus('✅ Password reset successfully! You can now login with your new password.', 'success');
          form.style.display = 'none';
          
          setTimeout(() => {
            console.log('Closing window...');
            window.close();
          }, 3000);
        } else {
          console.error('❌ Password reset failed:', data.error);
          showStatus(`❌ ${data.error}`, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Reset Password';
        }
      } catch (error) {
        console.error('❌ Error resetting password:', error);
        showStatus(`❌ Failed to reset password: ${error.message}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
      }
    });
  }
})();
