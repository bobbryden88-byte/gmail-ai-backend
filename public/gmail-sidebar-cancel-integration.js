/**
 * Gmail Sidebar Cancel Subscription Integration
 * 
 * This script automatically integrates the cancel subscription button
 * into your Gmail extension sidebar.
 * 
 * USAGE:
 * 1. Include this file in your extension
 * 2. Call initCancelButton() after your sidebar renders
 * 3. Pass trial status data when available
 * 
 * The button will automatically:
 * - Appear when user has Pro subscription
 * - Hide when user is on free plan
 * - Handle cancellation with confirmation dialog
 * - Refresh UI after cancellation
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_BASE_URL: 'https://gmail-ai-backend.vercel.app', // Update if needed
    BUTTON_ID: 'inkwell-cancel-subscription-btn',
    BUTTON_TEXT: 'Cancel Subscription',
    BUTTON_TEXT_LOADING: 'Cancelling...',
    OVERLAY_ID: 'inkwell-cancel-overlay',
    TOAST_ID: 'inkwell-toast'
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize cancel button
   * Call this after sidebar renders and you have trial status
   * 
   * @param {Object} trialStatus - Trial status from API
   * @param {Function} getAuthToken - Function that returns JWT token
   * @param {Function} refreshCallback - Optional callback to refresh UI after cancel
   */
  function initCancelButton(trialStatus, getAuthToken, refreshCallback) {
    if (!trialStatus) {
      console.warn('[Inkwell Cancel] No trial status provided');
      return;
    }

    // Check if user has active subscription
    const hasActiveSubscription = checkHasActiveSubscription(trialStatus);

    if (hasActiveSubscription) {
      addCancelButton(trialStatus, getAuthToken, refreshCallback);
    } else {
      removeCancelButton();
    }
  }

  /**
   * Check if user has active subscription
   */
  function checkHasActiveSubscription(trialStatus) {
    // Check multiple possible field names
    const hasSubscription = trialStatus.has_subscription || 
                           trialStatus.hasSubscription ||
                           !!trialStatus.stripe_subscription_id ||
                           !!trialStatus.stripeSubscriptionId;

    const isActive = trialStatus.subscription_status === 'active' ||
                    trialStatus.subscriptionStatus === 'active' ||
                    trialStatus.subscription_status === 'trialing' ||
                    trialStatus.subscriptionStatus === 'trialing' ||
                    trialStatus.is_trialing ||
                    trialStatus.isTrialing ||
                    trialStatus.is_premium ||
                    trialStatus.isPremium;

    return hasSubscription && isActive;
  }

  // ============================================================================
  // CANCEL BUTTON
  // ============================================================================

  /**
   * Add cancel button to sidebar
   */
  function addCancelButton(trialStatus, getAuthToken, refreshCallback) {
    // Remove existing button
    removeCancelButton();

    // Find insertion point - try multiple strategies
    const insertionPoint = findInsertionPoint();

    if (!insertionPoint) {
      console.warn('[Inkwell Cancel] Could not find insertion point for cancel button');
      return;
    }

    // Create button
    const button = createCancelButton(trialStatus, getAuthToken, refreshCallback);

    // Insert button
    insertionPoint.insertAdjacentElement('afterend', button);
  }

  /**
   * Find where to insert the cancel button
   */
  function findInsertionPoint() {
    // Strategy 1: Find "CURRENT PLAN" text and get its parent
    const currentPlanText = Array.from(document.querySelectorAll('*')).find(el => {
      const text = el.textContent || '';
      return text.includes('CURRENT PLAN') || 
             text.includes('Current Plan') ||
             text.includes('CURRENT PLAN');
    });

    if (currentPlanText) {
      return currentPlanText.closest('div') || currentPlanText.parentElement;
    }

    // Strategy 2: Find Pro Plan section by looking for pricing
    const proPlanSection = document.querySelector('[class*="pro"]') ||
                          document.querySelector('[class*="plan"]') ||
                          document.querySelector('[class*="subscription"]');

    if (proPlanSection) {
      return proPlanSection;
    }

    // Strategy 3: Find Monthly/Yearly buttons and get their container
    const monthlyBtn = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent && btn.textContent.includes('Monthly')
    );
    const yearlyBtn = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent && btn.textContent.includes('Yearly')
    );

    if (monthlyBtn || yearlyBtn) {
      return (monthlyBtn || yearlyBtn).closest('div') || 
             (monthlyBtn || yearlyBtn).parentElement;
    }

    // Strategy 4: Find "Secure payment via Stripe" text
    const stripeText = Array.from(document.querySelectorAll('*')).find(el => {
      const text = el.textContent || '';
      return text.includes('Secure payment') || text.includes('Stripe');
    });

    if (stripeText) {
      return stripeText.closest('div') || stripeText.parentElement;
    }

    // Strategy 5: Find sidebar container and insert at end
    const sidebar = document.querySelector('[class*="sidebar"]') ||
                   document.querySelector('[id*="sidebar"]') ||
                   document.querySelector('[class*="inkwell"]');

    return sidebar || document.body;
  }

  /**
   * Create cancel button element
   */
  function createCancelButton(trialStatus, getAuthToken, refreshCallback) {
    const button = document.createElement('button');
    button.id = CONFIG.BUTTON_ID;
    button.className = 'inkwell-cancel-subscription-btn';
    button.textContent = CONFIG.BUTTON_TEXT;
    
    // Apply styles
    applyButtonStyles(button);

    // Add click handler
    button.addEventListener('click', () => {
      handleCancelClick(trialStatus, getAuthToken, refreshCallback, button);
    });

    return button;
  }

  /**
   * Apply button styles
   */
  function applyButtonStyles(button) {
    button.style.cssText = `
      width: 100%;
      padding: 12px 16px;
      margin: 16px 0;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#c82333';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#dc3545';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });
  }

  /**
   * Remove cancel button
   */
  function removeCancelButton() {
    const existing = document.getElementById(CONFIG.BUTTON_ID);
    if (existing) {
      existing.remove();
    }
  }

  // ============================================================================
  // CANCEL HANDLER
  // ============================================================================

  /**
   * Handle cancel button click
   */
  function handleCancelClick(trialStatus, getAuthToken, refreshCallback, button) {
    showCancelConfirmationDialog(trialStatus, getAuthToken, refreshCallback, button);
  }

  /**
   * Show confirmation dialog
   */
  function showCancelConfirmationDialog(trialStatus, getAuthToken, refreshCallback, button) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = CONFIG.OVERLAY_ID;
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
      executeCancel(trialStatus, getAuthToken, refreshCallback, button);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  /**
   * Execute cancellation
   */
  async function executeCancel(trialStatus, getAuthToken, refreshCallback, button) {
    // Show loading state
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = CONFIG.BUTTON_TEXT_LOADING;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';

    try {
      // Get auth token
      const token = typeof getAuthToken === 'function' ? 
                    await getAuthToken() : 
                    getAuthToken ||
                    localStorage.getItem('inkwell_token') ||
                    sessionStorage.getItem('inkwell_token');

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Call cancel endpoint
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/stripe/cancel-subscription`, {
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
        
        // Remove button
        removeCancelButton();
        
        // Refresh UI
        if (typeof refreshCallback === 'function') {
          await refreshCallback();
        } else if (typeof loadTrialStatus === 'function') {
          await loadTrialStatus();
        } else if (typeof refreshTrialStatus === 'function') {
          await refreshTrialStatus();
        } else {
          // Fallback: reload after delay
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location) {
              window.location.reload();
            }
          }, 1500);
        }
      } else {
        // Error
        showToast(data.message || data.error || 'Failed to cancel subscription', 'error');
        
        // Restore button
        button.disabled = false;
        button.textContent = originalText;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    } catch (error) {
      console.error('[Inkwell Cancel] Error:', error);
      showToast('An error occurred. Please try again or contact support.', 'error');
      
      // Restore button
      button.disabled = false;
      button.textContent = originalText;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
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
    const existing = document.getElementById(CONFIG.TOAST_ID);
    if (existing) {
      existing.remove();
    }

    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };

    const toast = document.createElement('div');
    toast.id = CONFIG.TOAST_ID;
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add animation if not already added
    if (!document.getElementById('inkwell-toast-style')) {
      const style = document.createElement('style');
      style.id = 'inkwell-toast-style';
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
      document.head.appendChild(style);
    }

    // Auto remove
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
  // EXPORT
  // ============================================================================

  // Make available globally
  if (typeof window !== 'undefined') {
    window.initCancelButton = initCancelButton;
    window.removeCancelButton = removeCancelButton;
  }

  // Auto-initialize if trial status is available in global scope
  if (typeof window !== 'undefined' && window.trialStatus) {
    setTimeout(() => {
      initCancelButton(
        window.trialStatus,
        () => window.getAuthToken ? window.getAuthToken() : localStorage.getItem('inkwell_token'),
        window.loadTrialStatus || window.refreshTrialStatus
      );
    }, 1000);
  }

})();
