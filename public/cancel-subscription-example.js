/**
 * Cancel Subscription Frontend Implementation Example
 * 
 * This file shows how to integrate the cancel subscription feature
 * into your Gmail Chrome Extension sidebar.
 * 
 * Integration points:
 * 1. Add cancel button to UI (in updateUIWithTrialStatus or similar)
 * 2. Add confirmation dialog
 * 3. Call cancel endpoint
 * 4. Update UI after cancellation
 */

// ============================================================================
// 1. ADD CANCEL BUTTON TO UI
// ============================================================================

/**
 * Add cancel button to the sidebar UI
 * Call this in your updateUIWithTrialStatus() or renderSidebar() function
 */
function addCancelSubscriptionButton(trialStatus) {
  const sidebar = document.getElementById('inkwell-sidebar'); // Adjust selector as needed
  if (!sidebar) return;

  // Remove existing cancel button if present
  const existingBtn = sidebar.querySelector('#cancel-subscription-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // Only show cancel button if user has active subscription
  const hasActiveSubscription = trialStatus.has_subscription && 
                                (trialStatus.subscription_status === 'active' || 
                                 trialStatus.subscription_status === 'trialing');

  if (!hasActiveSubscription) {
    return; // Don't show button if no active subscription
  }

  // Create cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.id = 'cancel-subscription-btn';
  cancelBtn.className = 'cancel-subscription-btn';
  cancelBtn.textContent = 'Cancel Plan';
  cancelBtn.style.cssText = `
    width: 100%;
    padding: 10px;
    margin-top: 15px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  `;

  // Hover effect
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.backgroundColor = '#c82333';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.backgroundColor = '#dc3545';
  });

  // Click handler
  cancelBtn.addEventListener('click', () => {
    showCancelConfirmationDialog();
  });

  // Insert button after Pro Plan section or in settings area
  const proPlanSection = sidebar.querySelector('.pro-plan-section') || 
                         sidebar.querySelector('.subscription-section') ||
                         sidebar.lastElementChild;
  
  if (proPlanSection) {
    proPlanSection.insertAdjacentElement('afterend', cancelBtn);
  } else {
    sidebar.appendChild(cancelBtn);
  }
}

// ============================================================================
// 2. CONFIRMATION DIALOG
// ============================================================================

/**
 * Show confirmation dialog before cancelling
 */
function showCancelConfirmationDialog() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'cancel-confirmation-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  // Create dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  dialog.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">
      Cancel Pro Subscription?
    </h3>
    <p style="margin: 0 0 8px 0; color: #666; line-height: 1.5;">
      Are you sure you want to cancel your Pro subscription?
    </p>
    <p style="margin: 0 0 24px 0; color: #dc3545; font-weight: 500; line-height: 1.5;">
      ⚠️ You will lose access to Pro features immediately.
    </p>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="cancel-dialog-keep-btn" style="
        padding: 8px 16px;
        background: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      ">Keep Plan</button>
      <button id="cancel-dialog-confirm-btn" style="
        padding: 8px 16px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      ">Cancel Plan</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Keep Plan button
  document.getElementById('cancel-dialog-keep-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  // Cancel Plan button
  document.getElementById('cancel-dialog-confirm-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
    cancelSubscription();
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// ============================================================================
// 3. CANCEL SUBSCRIPTION FUNCTION
// ============================================================================

/**
 * Call the cancel subscription endpoint
 */
async function cancelSubscription() {
  const cancelBtn = document.getElementById('cancel-subscription-btn');
  if (!cancelBtn) return;

  // Show loading state
  const originalText = cancelBtn.textContent;
  cancelBtn.disabled = true;
  cancelBtn.textContent = 'Cancelling...';
  cancelBtn.style.opacity = '0.6';
  cancelBtn.style.cursor = 'not-allowed';

  try {
    // Get auth token (adjust based on your auth implementation)
    const token = localStorage.getItem('inkwell_token') || 
                  await getAuthToken(); // Your auth function

    if (!token) {
      throw new Error('Authentication required');
    }

    // Get API base URL
    const apiBaseUrl = 'https://gmail-ai-backend.vercel.app'; // Adjust to your backend URL

    // Call cancel endpoint
    const response = await fetch(`${apiBaseUrl}/api/stripe/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      // Success - show success message
      showSuccessMessage('Subscription cancelled successfully');
      
      // Refresh trial status to update UI
      if (typeof loadTrialStatus === 'function') {
        await loadTrialStatus();
      } else if (typeof refreshTrialStatus === 'function') {
        await refreshTrialStatus();
      } else {
        // Fallback: reload the sidebar
        location.reload();
      }

      // Remove cancel button (will be hidden by addCancelSubscriptionButton)
      cancelBtn.remove();
    } else {
      // Error - show error message
      showErrorMessage(data.error || data.message || 'Failed to cancel subscription');
      
      // Restore button
      cancelBtn.disabled = false;
      cancelBtn.textContent = originalText;
      cancelBtn.style.opacity = '1';
      cancelBtn.style.cursor = 'pointer';
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    showErrorMessage('An error occurred. Please try again or contact support.');
    
    // Restore button
    cancelBtn.disabled = false;
    cancelBtn.textContent = originalText;
    cancelBtn.style.opacity = '1';
    cancelBtn.style.cursor = 'pointer';
  }
}

// ============================================================================
// 4. UI UPDATE HELPERS
// ============================================================================

/**
 * Show success message
 */
function showSuccessMessage(message) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 10001;
    font-size: 14px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 10001;
    font-size: 14px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

// ============================================================================
// 5. INTEGRATION WITH EXISTING CODE
// ============================================================================

/**
 * Example: Update your existing updateUIWithTrialStatus function
 * 
 * function updateUIWithTrialStatus(trialStatus) {
 *   // ... existing code ...
 *   
 *   // Add cancel button
 *   addCancelSubscriptionButton(trialStatus);
 *   
 *   // ... rest of your code ...
 * }
 */

/**
 * Example: Update your loadTrialStatus function
 * 
 * async function loadTrialStatus() {
 *   try {
 *     const response = await fetch(`${API_BASE_URL}/api/trial/status`, {
 *       headers: {
 *         'Authorization': `Bearer ${getAuthToken()}`
 *       }
 *     });
 *     const data = await response.json();
 *     
 *     if (data.success) {
 *       updateUIWithTrialStatus(data);
 *       addCancelSubscriptionButton(data); // Add cancel button
 *     }
 *   } catch (error) {
 *     console.error('Failed to load trial status:', error);
 *   }
 * }
 */
