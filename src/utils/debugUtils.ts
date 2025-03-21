
/**
 * Utility functions for debugging authentication and routing issues
 */

/**
 * Logs user state information to help debug navigation issues
 */
export const logAuthState = async () => {
  try {
    console.group("🔍 Auth State Debug Info");
    
    // Check LocalStorage values
    console.log("LocalStorage values:");
    console.log("- user_is_admin:", localStorage.getItem('user_is_admin'));
    console.log("- subscription_activated:", localStorage.getItem('subscription_activated'));
    console.log("- payment_in_progress:", localStorage.getItem('payment_in_progress'));
    console.log("- session_token:", !!localStorage.getItem('session_token'));
    
    // Current location
    console.log("Current path:", window.location.pathname);
    
    // Navigation history length
    console.log("History length:", window.history.length);
    
    // Clear any problematic flags if requested
    const clearAll = false; // Set to true only when necessary
    if (clearAll) {
      localStorage.removeItem('user_is_admin');
      localStorage.removeItem('subscription_activated');
      localStorage.removeItem('payment_in_progress');
      localStorage.removeItem('postPaymentConfirmation');
      localStorage.removeItem('direct_payment_redirect');
      console.log("⚠️ All navigation flags cleared!");
    }
    
    console.groupEnd();
  } catch (error) {
    console.error("Error in logAuthState:", error);
  }
};

/**
 * Call this function to manually break redirection loops
 */
export const breakRedirectLoop = () => {
  // Set a flag that will prevent further redirects for 30 seconds
  localStorage.setItem('redirect_break', 'true');
  setTimeout(() => {
    localStorage.removeItem('redirect_break');
  }, 30000);
  
  // Clear all navigation-related flags
  localStorage.removeItem('user_is_admin');
  localStorage.removeItem('subscription_activated');
  localStorage.removeItem('payment_in_progress');
  localStorage.removeItem('postPaymentConfirmation');
  localStorage.removeItem('direct_payment_redirect');
  
  console.log("🛑 Navigation loop breaker activated for 30 seconds");
  console.log("🧹 All navigation flags cleared");
  
  return "Navigation flags cleared. Please try navigating manually now.";
};
