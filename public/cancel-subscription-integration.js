/**
 * Cancel Subscription Integration Script
 * 
 * Add this script to your Chrome extension to enable subscription cancellation.
 * 
 * USAGE:
 * 1. Include this file in your extension's manifest.json
 * 2. Call initCancelSubscription() after your sidebar is rendered
 * 3. Pass the trial status data when calling initCancelSubscription()
 * 
 * Example:
 *   initCancelSubscription(trialStatusData, apiBaseUrl, getAuthToken);
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize cancel subscription feature
 * Call this after your sidebar is rendered and you have trial status data
 * 
 * @param {Object} trialStatus - Trial status from /api/trial/status endpoint
 * @param {string} apiBaseUrl - Your backend API URL (e.g., 'https://gmail-ai-backend.vercel.app')
 * @param {Function} getAuthToken - Function that returns the JWT token
 */
function initCancelSubscription(trialStatus, apiBaseUrl, getAuthToken) {
  // Check if user has active subscription
  const hasActiveSubscription = trialStatus.has_subscription && 
                                (trialStatus.subscription_status === 'active' || 
                                 trialStatus.subscription_status === 'trialing');

  if (hasActiveSubscription) {
    addCancelButton(trialStatus, apiBaseUrl, getAuthToken);
  } else {
    // Remove button if it exists but user no longer has subscription
    removeCancelButton();
  }
}

// ============================================================================
// CANCEL BUTTON
// ============================================================================

/**
 * Add cancel button to the sidebar
 */
function addCancelButton(trialStatus, apiBaseUrl, getAuthToken) {
  // Remove existing button if present
  removeCancelButton();

  // Find where to insert the button
  // Try multiple selectors to find the plan section
  const planSection = document.querySelector('.current-plan-section') ||
                     document.querySelector('[class*="plan"]') ||
                     document.querySelector('[class*="subscription"]') ||
                     document.querySelector('[class*="CURRENT PLAN"]') ||
                     document.querySelector('button:contains("Monthly")')?.closest('div') ||
                     document.querySelector('button:contains("Yearly")')?.closest('div');

  // If we can't find a specific section, try to find the sidebar container
  const sidebar = document.querySelector('[class*="sidebar"]') ||
                  document.querySelector('[id*="sidebar"]') ||
                  document.querySelector('[class*="inkwell"]') ||
                  document.body;

  // Create cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.id = 'inkwell-cancel-subscription-btn';
  cancelBtn.className = 'inkwell-cancel-subscription-btn';
  cancelBtn.textContent = 'Cancel Subscription';
  cancelBtn.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-top: 20px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    showCancelConfirmationDialog(trialStatus, apiBaseUrl, getAuthToken);
  });

  // Insert button
  if (planSection) {
    planSection.insertAdjacentElement('afterend', cancelBtn);
  } else {
    // Try to insert after "CURRENT PLAN" text or plan selection
    const currentPlanText = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent && el.textContent.includes('CURRENT PLAN')
    );
    if (currentPlanText) {
      currentPlanText.parentElement.insertAdjacentElement('afterend', cancelBtn);
    } else {
      sidebar.appendChild(cancelBtn);
    }
  }
}

/**
 * Remove cancel button
 */
function removeCancelButton() {
  const existingBtn = document.getElementById('inkwell-cancel-subscription-btn');
  if (existingBtn) {
    existingBtn.remove();
  }
}

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

/**
 * Show confirmation dialog
 */
function showCancelConfirmationDialog(trialStatus, apiBaseUrl, getAuthToken) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'inkwell-cancel-overlay';
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
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  `;

  dialog.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #333;">
      Cancel Pro Subscription?
    </h3>
    <p style="margin: 0 0 8px 0; color: #666; line-height: 1.5; font-size: 14px;">
      Are you sure you want to cancel your Pro subscription?
    </p>
    <p style="margin: 0 0 24px 0; color: #dc3545; font-weight: 500; line-height: 1.5; font-size: 14px;">
      ⚠️ You will lose access to Pro features immediately.
    </p>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="inkwell-cancel-keep-btn" style="
        padding: 10px 20px;
        background: #f0f0f0;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #333;
      ">Keep Plan</button>
      <button id="inkwell-cancel-confirm-btn" style="
        padding: 10px 20px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      ">Cancel Plan</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Keep Plan button
  document.getElementById('inkwell-cancel-keep-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  // Cancel Plan button
  document.getElementById('inkwell-cancel-confirm-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
    cancelSubscription(apiBaseUrl, getAuthToken);
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// ============================================================================
// CANCEL SUBSCRIPTION API CALL
// ============================================================================

/**
 * Call the cancel subscription endpoint
 */
async function cancelSubscription(apiBaseUrl, getAuthToken) {
  const cancelBtn = document.getElementById('inkwell-cancel-subscription-btn');
  if (!cancelBtn) return;

  // Show loading state
  const originalText = cancelBtn.textContent;
  cancelBtn.disabled = true;
  cancelBtn.textContent = 'Cancelling...';
  cancelBtn.style.opacity = '0.6';
  cancelBtn.style.cursor = 'not-allowed';

  try {
    // Get auth token
    const token = typeof getAuthToken === 'function' ? await getAuthToken() : 
                  localStorage.getItem('inkwell_token') ||
                  sessionStorage.getItem('inkwell_token');

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

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
      // Success
      showToast('Subscription cancelled successfully', 'success');
      
      // Remove cancel button
      removeCancelButton();
      
      // Refresh the page or reload trial status
      // Adjust this based on how your extension refreshes data
      if (typeof window.location !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (typeof refreshTrialStatus === 'function') {
        await refreshTrialStatus();
      } else if (typeof loadTrialStatus === 'function') {
        await loadTrialStatus();
      }
    } else {
      // Error
      showToast(data.message || data.error || 'Failed to cancel subscription', 'error');
      
      // Restore button
      cancelBtn.disabled = false;
      cancelBtn.textContent = originalText;
      cancelBtn.style.opacity = '1';
      cancelBtn.style.cursor = 'pointer';
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    showToast('An error occurred. Please try again or contact support.', 'error');
    
    // Restore button
    cancelBtn.disabled = false;
    cancelBtn.textContent = originalText;
    cancelBtn.style.opacity = '1';
    cancelBtn.style.cursor = 'pointer';
  }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.getElementById('inkwell-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const colors = {
    success: '#28a745',
    error: '#dc3545',
    info: '#17a2b8'
  };

  const toast = document.createElement('div');
  toast.id = 'inkwell-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 14px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000000;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  if (!document.head.querySelector('#inkwell-toast-style')) {
    style.id = 'inkwell-toast-style';
    document.head.appendChild(style);
  }

  // Auto remove after 3-5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, type === 'error' ? 5000 : 3000);
}

// ============================================================================
// EXPORT FOR USE
// ============================================================================

// Make functions available globally
if (typeof window !== 'undefined') {
  window.initCancelSubscription = initCancelSubscription;
  window.addCancelButton = addCancelButton;
  window.removeCancelButton = removeCancelButton;
  window.cancelSubscription = cancelSubscription;
}
