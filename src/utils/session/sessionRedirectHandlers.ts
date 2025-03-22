import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";
import { areRedirectsDisabled, isPublicRoute } from "@/utils/navigation";

/**
 * Handles post-payment navigation 
 */
export const handlePostPaymentRedirect = async (
  isPostPayment: boolean,
  isNewUserSignup: boolean,
  location: { pathname: string },
  navigate: NavigateFunction
): Promise<boolean> => {
  // Check if we're already on the chat page and in post-payment or new signup state
  // This prevents the redirect loop that causes flashing
  if ((isPostPayment || isNewUserSignup) && location.pathname === '/chat') {
    console.log("[SessionCheck] Already on chat page with post-payment/new signup state, skipping redirect");
    // Clear the flags to prevent future redirects
    localStorage.removeItem('subscription_activated');
    localStorage.removeItem('postPaymentConfirmation');
    localStorage.removeItem('payment_in_progress');
    localStorage.removeItem('direct_payment_redirect');
    localStorage.removeItem('new_user_signup');
    return true; // Handled, no further checks needed
  }
  
  // If this is a direct redirect from payment and we're on the chat page,
  // don't do any further processing to avoid redirect loops
  const isDirectPaymentRedirect = localStorage.getItem('direct_payment_redirect') === 'true';
  if (isDirectPaymentRedirect && location.pathname === '/chat') {
    console.log("[SessionCheck] Direct payment redirect detected, skipping further processing");
    localStorage.removeItem('direct_payment_redirect');
    return true; // Handled, no further checks needed
  }
  
  // Handle new user signup explicitly
  if (isNewUserSignup) {
    console.log("[SessionCheck] New user signup detected, redirecting to chat");
    localStorage.removeItem('new_user_signup');
    navigate('/chat', { replace: true });
    return true; // Handled, no further checks needed
  }
  
  return false; // Not handled, continue with other checks
};

/**
 * Handle the post-payment state with session restoration attempts
 */
export const handleSubscriptionActivation = async (
  userId: string | undefined,
  navigate: NavigateFunction
): Promise<boolean> => {
  console.log("[SessionCheck] CRITICAL: Post-payment state detected");
  
  // Update profile immediately with subscription data
  if (userId) {
    console.log("[SessionCheck] Updating profile subscription status for user:", userId);
    
    const selectedPlan = localStorage.getItem('selected_plan') || 'monthly';
    console.log("[SessionCheck] Setting subscription plan to:", selectedPlan);
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[SessionCheck] Profile update attempt ${attempt}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            subscription_plan: selectedPlan
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error(`[SessionCheck] Error updating profile (attempt ${attempt}):`, updateError);
          if (attempt < 3) await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
        } else {
          console.log("[SessionCheck] Profile successfully updated with active subscription");
          break; // Success, exit retry loop
        }
      } catch (updateErr) {
        console.error(`[SessionCheck] Exception in profile update (attempt ${attempt}):`, updateErr);
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
      }
    }
      
    // Set tokens in cookies for added persistence - critical for keeping session between page loads
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session) {
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      console.log("[SessionCheck] Session tokens stored in cookies for persistence");
    }
  }
  
  // Wait briefly to ensure profile update completes, then navigate to chat
  console.log("[SessionCheck] Waiting briefly before redirecting to chat page");
  setTimeout(() => {
    console.log("[SessionCheck] Now navigating to chat page");
    // Use window.location.href instead of navigate to force a full page reload
    // This helps clear any stale state that might be causing the flashing
    window.location.href = `${window.location.origin}/chat`;
  }, 1500);
  
  return true; // Indicate that we handled the subscription activation
};

/**
 * Check if the session exists and redirect to login if not
 */
export const checkSessionExists = async (
  location: { pathname: string },
  navigate: NavigateFunction,
  toast: typeof toastFunction
): Promise<{ session: any; exists: boolean }> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("[SessionCheck] Session error:", sessionError);
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    return { session: null, exists: false };
  }

  if (!session) {
    console.log("[SessionCheck] No active session found, redirecting to login");
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    return { session: null, exists: false };
  }

  return { session, exists: true };
};

/**
 * Check user's subscription status and admin status
 */
export const checkUserStatus = async (
  userId: string,
  location: { pathname: string },
  navigate: NavigateFunction,
  isInitialCheck: boolean,
  toast: typeof toastFunction
): Promise<boolean> => {
  // Check subscription status and admin status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_plan, query_count, is_admin')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error("[SessionCheck] Error fetching profile:", profileError);
    return false;
  }
  
  console.log("[SessionCheck] User profile:", profile);
  
  // Check if user is admin - admins bypass subscription checks
  if (profile?.is_admin) {
    console.log("[SessionCheck] Admin user detected, bypassing subscription checks");
    // Store admin status in localStorage for quick access
    localStorage.setItem('user_is_admin', 'true');
    
    // Don't force redirect admins to specific pages, let them browse freely
    return false; // No redirect needed
  } else {
    // Ensure admin flag is removed for non-admin users
    localStorage.removeItem('user_is_admin');
  }
  
  // Check for recently signed up users - don't force them back to chat if they navigate away
  if (sessionStorage.getItem('recently_signed_up') === 'true' && 
      location.pathname !== '/chat' && 
      isInitialCheck) {
    console.log("[SessionCheck] Recently signed up user, initial navigation to chat");
    navigate('/chat', { replace: true });
    sessionStorage.removeItem('recently_signed_up'); // Remove flag after initial navigation
    return true; // Handled, no further checks needed
  }
  
  // Only redirect if explicitly inactive AND not free
  if (profile?.subscription_status === 'inactive' && 
      profile?.subscription_plan !== 'free' && 
      profile?.subscription_plan !== 'trial_ended') {
    console.log("[SessionCheck] Subscription inactive, redirecting to pricing");
    navigate('/?scrollTo=pricing-section', { replace: true });
    return true; // Handled, no further checks needed
  }
  
  // Check for free trial ended condition separately
  if (profile?.subscription_plan === 'free' && profile?.query_count >= 2 && 
      location.pathname !== '/' && !localStorage.getItem('login_in_progress')) {
    console.log("[SessionCheck] Free trial ended, redirecting to pricing");
    navigate('/?scrollTo=pricing-section', { replace: true });
    return true; // Handled, no further checks needed
  }
  
  // Redirect authenticated users on root to chat if not at pricing section
  if (location.pathname === '/' && 
      !window.location.href.includes('scrollTo=pricing') && 
      !localStorage.getItem('payment_in_progress') &&
      isInitialCheck) {
    console.log("[SessionCheck] Authenticated user on homepage, redirecting to chat");
    navigate('/chat', { replace: true });
    return true; // Handled with redirect
  }
  
  // Redirect authenticated users on login/signup pages to chat
  if ((location.pathname === '/login' || location.pathname === '/signup') && 
      !localStorage.getItem('payment_in_progress')) {
    navigate('/chat', { replace: true });
    return true; // Handled with redirect
  }
  
  return false; // No redirect needed
};

/**
 * Handle special cases to prevent redirect loops
 */
export const shouldSkipChecks = (location: { pathname: string }): boolean => {
  // Skip all redirect checks if redirects are disabled
  if (areRedirectsDisabled()) {
    console.log("[SessionCheck] Redirects are currently disabled, skipping all checks");
    return true;
  }
  
  // Anti-flicker: Skip checks during login/signup process
  if (localStorage.getItem('login_in_progress') === 'true' || 
      localStorage.getItem('signup_in_progress') === 'true') {
    console.log("[SessionCheck] Login/signup in progress, skipping check");
    return true;
  }

  // Check if this is a public route - don't redirect from public routes
  if (isPublicRoute(location.pathname)) {
    console.log("[SessionCheck] On public route, skipping authentication check");
    return true;
  }
  
  return false;
};

/**
 * Gets the current session using multiple fallback methods
 */
export const getSessionWithFallbacks = async (): Promise<any> => {
  let session = null;
  
  // Method 1: Get session from auth
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    console.log("[SessionCheck] Session method 1 result:", !!session);
  } catch (e) {
    console.error("[SessionCheck] Error in session method 1:", e);
  }
  
  // Method 2: Try to refresh session if method 1 failed
  if (!session) {
    try {
      console.log("[SessionCheck] No session found, attempting refresh");
      const { data: refreshData } = await supabase.auth.refreshSession();
      session = refreshData.session;
      console.log("[SessionCheck] Session refresh result:", !!session);
    } catch (refreshErr) {
      console.error("[SessionCheck] Error in session refresh:", refreshErr);
    }
  }
  
  // Method 3: Try to restore from saved tokens
  if (!session) {
    try {
      console.log("[SessionCheck] Attempting token restoration");
      const savedAccessToken = localStorage.getItem('auth_access_token');
      const savedRefreshToken = localStorage.getItem('auth_refresh_token');
      
      if (savedAccessToken && savedRefreshToken) {
        console.log("[SessionCheck] Found saved tokens, attempting restoration");
        const { data: tokenData } = await supabase.auth.setSession({
          access_token: savedAccessToken,
          refresh_token: savedRefreshToken
        });
        session = tokenData.session;
        console.log("[SessionCheck] Token restoration result:", !!session);
      }
    } catch (tokenErr) {
      console.error("[SessionCheck] Error in token restoration:", tokenErr);
    }
  }
  
  // Method 4: Try one more approach with cookies
  if (!session) {
    try {
      console.log("[SessionCheck] Checking for session cookies");
      
      // Try to get tokens from cookies
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      
      const cookieAccessToken = getCookie('sb-access-token');
      const cookieRefreshToken = getCookie('sb-refresh-token');
      
      if (cookieAccessToken && cookieRefreshToken) {
        console.log("[SessionCheck] Found cookie tokens, attempting restoration");
        const { data: cookieData } = await supabase.auth.setSession({
          access_token: cookieAccessToken,
          refresh_token: cookieRefreshToken
        });
        session = cookieData.session;
        console.log("[SessionCheck] Cookie restoration result:", !!session);
      }
    } catch (cookieErr) {
      console.error("[SessionCheck] Error in cookie restoration:", cookieErr);
    }
  }
  
  return session;
};
