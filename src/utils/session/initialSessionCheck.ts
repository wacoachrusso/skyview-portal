import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionStore } from "@/stores/session";


/**
 * Checks for new user signup and handles redirect if needed
 */
export const handleNewUserSignup = (navigate: NavigateFunction): boolean => {
  const { isNewUserSignup, setIsNewUserSignup } = useSessionStore.getState();
  
  // Only redirect to chat if not already on the chat page
  if (isNewUserSignup && window.location.pathname !== '/chat') {
    console.log("New user signup detected, redirecting to chat");
    setIsNewUserSignup(false); // Clear the flag immediately to prevent future redirects
    navigate('/chat', { replace: true });
    return true;
  }
  
  // Clear the flag if we're already on the chat page to prevent future redirects
  if (isNewUserSignup && window.location.pathname === '/chat') {
    setIsNewUserSignup(false);
  }
  
  return false;
};

/**
 * Attempts to restore a session from saved tokens
 */
export const tryRestoreSession = async (pathname: string): Promise<boolean> => {
  console.log("Attempting to restore session from saved tokens");
  
  const { accessToken, refreshToken } = useSessionStore.getState();
  
  if (accessToken && refreshToken) {
    try {
      // First try: Use setSession with saved tokens
      const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (!restoreError && sessionData.session) {
        console.log("Successfully restored session after payment");
        
        // Create a new session token if we have a user ID
        if (sessionData.session.user.id) {
          try {
            const { createNewSession } = await import('@/services/session');
            await createNewSession(sessionData.session.user.id);
            console.log("Created new session token after restoration");
          } catch (sessionErr) {
            console.error("Error creating session token:", sessionErr);
          }
        }
        
        window.location.href = `${window.location.origin}/chat`;
        return true;
      }
      
      // Second try: Use refreshSession
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && refreshData.session) {
        console.log("Successfully recovered session via refresh");
        
        // Create a new session token if we have a user ID
        if (refreshData.session.user.id) {
          try {
            const { createNewSession } = await import('@/services/session');
            await createNewSession(refreshData.session.user.id);
            console.log("Created new session token after refresh");
          } catch (sessionErr) {
            console.error("Error creating session token:", sessionErr);
          }
        }
        
        window.location.href = `${window.location.origin}/chat`;
        return true;
      }
      
      // Third try: Try to get session from cookies
      const { data: cookieSession } = await supabase.auth.getSession();
      
      if (cookieSession.session) {
        console.log("Successfully recovered session from cookies");
        
        // Create a new session token if we have a user ID
        if (cookieSession.session.user.id) {
          try {
            const { createNewSession } = await import('@/services/session');
            await createNewSession(cookieSession.session.user.id);
            console.log("Created new session token after recovery");
          } catch (sessionErr) {
            console.error("Error creating session token:", sessionErr);
          }
        }
        
        window.location.href = `${window.location.origin}/chat`;
        return true;
      }
    } catch (error) {
      console.error("Unexpected error restoring session:", error);
    }
  }
  
  return false;
};

/**
 * Checks if a path is a public route that doesn't require authentication
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/', 
    '/auth/callback', 
    '/privacy-policy', 
    '/about',
    '/help-center',
    '/WebViewDemo'
  ];
  
  return publicRoutes.includes(pathname);
};

/**
 * Checks if the user has an active subscription
 */
export const checkSubscriptionStatus = async (userId: string, navigate: NavigateFunction): Promise<void> => {
  const { redirectToPricing, setRedirectToPricing, setIsAdmin } = useSessionStore.getState();
  
  // Prevent redirect loop by checking if we're already on the pricing page
  const isPricingPage = window.location.pathname === '/' && window.location.search.includes('scrollTo=pricing-section');
  if (isPricingPage) {
    console.log("[Initial Session] Already on pricing page, skipping redirect");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, query_count, is_admin')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error("[Initial Session] Error fetching profile:", profileError);
    return;
  }
  
  // Check if user is admin
  if (profile?.is_admin) {
    console.log("[Initial Session] Admin user detected in initial check");
    setIsAdmin(true);
    
    // Only redirect admin if they're on login/signup pages
    if (window.location.pathname === '/login' || 
        window.location.pathname === '/signup') {
      console.log("[Initial Session] Admin on auth page, redirecting to chat");
      navigate('/chat', { replace: true });
    }
    return;
  } else {
    setIsAdmin(false);
  }
  
  // Check for active paid subscription
  if (profile?.subscription_status === 'active' && 
      profile?.subscription_plan !== 'free' && 
      profile?.subscription_plan !== 'trial_ended') {
    console.log("[Initial Session] User has active subscription");
    
    // Only redirect if on login/signup pages
    if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
      navigate('/chat', { replace: true });
    }
    return;
  }
  
  // Free trial ended or inactive subscription - go to pricing
  if ((profile?.subscription_plan === 'free' && profile?.query_count >= 2) ||
      (profile?.subscription_status === 'inactive' && profile?.subscription_plan !== 'free')) {
    console.log("[Initial Session] Free trial ended/inactive subscription, going to pricing");
    
    // Add a flag to prevent redirect loops
    if (!redirectToPricing) {
      setRedirectToPricing(true);
      navigate('/?scrollTo=pricing-section', { replace: true });
      
      // Clear the flag after a delay to allow future redirects after the user navigates elsewhere
      setTimeout(() => {
        setRedirectToPricing(false);
      }, 5000);
    } else {
      console.log("[Initial Session] Preventing redirect loop to pricing page");
    }
  }
};

/**
 * Handles recovery after payment interruption
 */
export const handlePaymentRecovery = async (navigate: NavigateFunction): Promise<boolean> => {
  const { 
    paymentInProgress, 
    postPaymentConfirmation, 
    subscriptionActivated,
    clearPaymentFlags,
    clearSession
  } = useSessionStore.getState();
  
  // If we're at the login page but we have payment flags, attempt to recover the session
  if ((paymentInProgress || postPaymentConfirmation || subscriptionActivated) && 
      (window.location.pathname === '/login' || window.location.pathname === '/')) {
    console.log("[Initial Session] Payment flow interrupted, attempting to recover session");
    
    // Try to restore session from saved tokens
    const restored = await tryRestoreSession(window.location.pathname);
    
    if (!restored) {
      // All restoration attempts failed, clear payment flags
      console.log("[Initial Session] All session restoration attempts failed, clearing flags");
      clearPaymentFlags();
      clearSession();
    }
    
    return restored;
  }
  
  return false;
};

/**
 * Main function to check initial session
 */
export const performInitialSessionCheck = async (navigate: NavigateFunction): Promise<void> => {
  try {
    console.log("Checking initial session on app load");
    
    const { 
      skipInitialRedirect, 
      setSkipInitialRedirect, 
      recentlySignedUp, 
      setRecentlySignedUp,
      postPaymentConfirmation,
      clearPaymentFlags
    } = useSessionStore.getState();
    
    // Skip initial redirect if flag is set
    if (skipInitialRedirect) {
      console.log("[Initial Session] Skipping initial redirect due to flag");
      setSkipInitialRedirect(false);
      return;
    }
    
    // Handle new user signup first - only on initial page load
    if (handleNewUserSignup(navigate)) {
      return;
    }
    
    // Handle payment recovery next - highest priority
    if (await handlePaymentRecovery(navigate)) {
      return;
    }
    
    // Skip specific routes that handle their own auth
    if (window.location.pathname === '/auth/callback' || 
        window.location.pathname.includes('/stripe-callback')) {
      console.log("[Initial Session] Skipping session check for auth callback route");
      return;
    }
    
    // Check if on public route
    if (isPublicRoute(window.location.pathname)) {
      console.log("[Initial Session] User on public route:", window.location.pathname);
      // Don't redirect from public routes unless we have specific conditions
    }
    
    // For recently signed up users, ONLY redirect if we're not already on the chat page
    if (recentlySignedUp) {
      console.log("[Initial Session] Recently signed up user detected");
      if (window.location.pathname !== '/chat') {
        console.log("[Initial Session] Redirecting recent signup to chat page");
        navigate('/chat', { replace: true });
        return;
      } else {
        // Clear the flag to prevent future redirects
        setRecentlySignedUp(false);
      }
    }
    
    // Basic session check
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      console.log("[Initial Session] Active session found for user:", data.session.user.email);
      
      // Check subscription status - but don't redirect if already on a valid page
      await checkSubscriptionStatus(data.session.user.id, navigate);
      
      // Check if user just completed payment
      if (postPaymentConfirmation) {
        console.log("[Initial Session] Post-payment user with active session");
        // Only redirect if not already on the chat page
        if (window.location.pathname !== '/chat') {
          console.log("[Initial Session] Redirecting to chat page");
          window.location.href = `${window.location.origin}/chat`;
          return;
        } else {
          // Already on chat page, clear the flags to prevent future redirects
          console.log("[Initial Session] Already on chat page, clearing post-payment flags");
          clearPaymentFlags();
          return;
        }
      }
      
      // Only redirect from login/signup pages, allow access to home page
      if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
        navigate('/chat', { replace: true });
      }
    } else if (!isPublicRoute(window.location.pathname)) {
      // No session and trying to access protected route
      console.log("[Initial Session] No active session found, redirecting to login");
      navigate('/login', { replace: true });
    }
  } catch (error) {
    console.error("[Initial Session] Error checking initial session:", error);
  }
};