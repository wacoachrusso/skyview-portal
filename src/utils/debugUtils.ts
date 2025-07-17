
/**
 * Utility functions for debugging authentication and routing issues
 */

import { useSessionStore } from "@/stores/session";

/**
 * Logs user state information to help debug navigation issues
 */
export const logAuthState = async () => {
  try {
    console.group("🔍 Auth State Debug Info");
    
    // Get current store state
    const store = useSessionStore.getState();
    
    // Check store values
    console.log("Store values:");
    console.log("- isAdmin:", store.isAdmin);
    console.log("- subscriptionActivated:", store.subscriptionActivated);
    console.log("- paymentInProgress:", store.paymentInProgress);
    console.log("- sessionToken:", !!store.sessionToken);
    console.log("- userId:", store.userId);
    console.log("- userEmail:", store.userEmail);
    console.log("- postPaymentConfirmation:", store.postPaymentConfirmation);
    console.log("- skipInitialRedirect:", store.skipInitialRedirect);
    console.log("- redirectToPricing:", store.redirectToPricing);
    console.log("- apiCallInProgress:", store.apiCallInProgress);
    console.log("- isNewUserSignup:", store.isNewUserSignup);
    console.log("- recentlySignedUp:", store.recentlySignedUp);
    
    // Current location
    console.log("Current path:", window.location.pathname);
    
    // Navigation history length
    console.log("History length:", window.history.length);
    
    // Clear any problematic flags if requested
    const clearAll = false; // Set to true only when necessary
    if (clearAll) {
      store.clearAllFlags();
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
  const store = useSessionStore.getState();
  
  // Clear all navigation-related flags using store methods
  store.clearAllFlags();
  store.clearPaymentFlags();
  
  console.log("🛑 Navigation loop breaker activated");
  console.log("🧹 All navigation flags cleared via store");
  
  return "Navigation flags cleared. Please try navigating manually now.";
};

/**
 * Get current auth state for debugging
 */
export const getCurrentAuthState = () => {
  const store = useSessionStore.getState();
  return {
    sessionToken: !!store.sessionToken,
    userId: store.userId,
    userEmail: store.userEmail,
    isAdmin: store.isAdmin,
    subscriptionActivated: store.subscriptionActivated,
    paymentInProgress: store.paymentInProgress,
    postPaymentConfirmation: store.postPaymentConfirmation,
    skipInitialRedirect: store.skipInitialRedirect,
    redirectToPricing: store.redirectToPricing,
    apiCallInProgress: store.apiCallInProgress,
    isNewUserSignup: store.isNewUserSignup,
    recentlySignedUp: store.recentlySignedUp
  };
};