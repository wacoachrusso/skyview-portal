
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { areRedirectsDisabled, isPublicRoute } from "@/utils/navigation";

export function SessionCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isCheckingRef = useRef(false);
  const checkedOnceRef = useRef(false);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Prevent concurrent checks and redundant checks
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      
      try {
        console.log("[SessionCheck] Checking session status...");
        
        // Skip all redirect checks if redirects are disabled
        if (areRedirectsDisabled()) {
          console.log("[SessionCheck] Redirects are currently disabled, skipping all checks");
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }
        
        // Anti-flicker: Skip checks during login/signup process
        if (localStorage.getItem('login_in_progress') === 'true' || 
            localStorage.getItem('signup_in_progress') === 'true') {
          console.log("[SessionCheck] Login/signup in progress, skipping check");
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }

        // Skip session check on login page unless it's the initial check
        if (location.pathname === '/login' && !isInitialCheck) {
          console.log("[SessionCheck] Already on login page, skipping check");
          isCheckingRef.current = false;
          return;
        }
        
        // Check if this is a public route - don't redirect from public routes
        if (isPublicRoute(location.pathname)) {
          console.log("[SessionCheck] On public route, skipping authentication check");
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }
        
        // MOST CRITICAL CHECK: First check for post-payment state
        // This must override all other checks
        const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
        const isDirectPaymentRedirect = localStorage.getItem('direct_payment_redirect') === 'true';
        const isNewUserSignup = localStorage.getItem('new_user_signup') === 'true';
        
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
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }
        
        // If this is a direct redirect from payment and we're on the chat page,
        // don't do any further processing to avoid redirect loops
        if (isDirectPaymentRedirect && location.pathname === '/chat') {
          console.log("[SessionCheck] Direct payment redirect detected, skipping further processing");
          localStorage.removeItem('direct_payment_redirect');
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }
        
        // Handle new user signup explicitly
        if (isNewUserSignup) {
          console.log("[SessionCheck] New user signup detected, redirecting to chat");
          localStorage.removeItem('new_user_signup');
          navigate('/chat', { replace: true });
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }
        
        if (isPostPayment) {
          console.log("[SessionCheck] CRITICAL: Post-payment state detected");
          
          // Get the current session - try multiple methods for maximum reliability
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
          
          // If we still don't have a session, try one more approach with cookies
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
          
          // Last resort: If we still don't have a session, redirect to login
          if (!session) {
            console.error("[SessionCheck] CRITICAL: Could not restore session after payment");
            // Do NOT clear the subscription_activated flag since this will be needed when they login again
            // Just store a temporary flag to indicate we need to restore the subscription state after login
            localStorage.setItem('pending_subscription_activation', 'true');
            
            // Notify user clearly
            toast({
              title: "Session Expired",
              description: "Please log in again to access your subscription.",
              duration: 8000,
            });
            
            navigate('/login', { replace: true });
            isCheckingRef.current = false;
            setIsInitialCheck(false);
            return;
          }
          
          // If we have a session, update profile immediately with subscription data
          const userId = session?.user?.id;
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
            isCheckingRef.current = false;
            setIsInitialCheck(false);
          }, 1500);
          return;
        }

        // For non-payment flows: Regular session check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("[SessionCheck] No active session found, redirecting to login");
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
          isCheckingRef.current = false;
          setIsInitialCheck(false);
          return;
        }

        // Check subscription status and admin status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan, query_count, is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("[SessionCheck] Error fetching profile:", profileError);
        } else {
          console.log("[SessionCheck] User profile:", profile);
          
          // Check if user is admin - admins bypass subscription checks
          if (profile?.is_admin) {
            console.log("[SessionCheck] Admin user detected, bypassing subscription checks");
            // Store admin status in localStorage for quick access
            localStorage.setItem('user_is_admin', 'true');
            
            // Don't force redirect admins to specific pages, let them browse freely
            isCheckingRef.current = false;
            setIsInitialCheck(false);
            return;
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
            isCheckingRef.current = false;
            setIsInitialCheck(false);
            sessionStorage.removeItem('recently_signed_up'); // Remove flag after initial navigation
            return;
          }
          
          // Only redirect if explicitly inactive AND not free
          if (profile?.subscription_status === 'inactive' && 
              profile?.subscription_plan !== 'free' && 
              profile?.subscription_plan !== 'trial_ended') {
            console.log("[SessionCheck] Subscription inactive, redirecting to pricing");
            navigate('/?scrollTo=pricing-section', { replace: true });
            isCheckingRef.current = false;
            setIsInitialCheck(false);
            return;
          }
          
          // Check for free trial ended condition separately
          if (profile?.subscription_plan === 'free' && profile?.query_count >= 2 && 
              window.location.pathname !== '/' && !localStorage.getItem('login_in_progress')) {
            console.log("[SessionCheck] Free trial ended, redirecting to pricing");
            navigate('/?scrollTo=pricing-section', { replace: true });
            isCheckingRef.current = false;
            setIsInitialCheck(false);
            return;
          }
        }

        // If user is authenticated and on the root route, redirect to chat
        // IMPORTANT: This was causing redirect loops - now we only do this for the exact root path
        if (location.pathname === '/' && 
            !window.location.href.includes('scrollTo=pricing') && 
            !localStorage.getItem('payment_in_progress') &&
            isInitialCheck) {  // Only on initial check
          console.log("[SessionCheck] Authenticated user on homepage, redirecting to chat");
          navigate('/chat', { replace: true });
        }
        
        isCheckingRef.current = false;
        setIsInitialCheck(false);
      } catch (error) {
        console.error("[SessionCheck] Error:", error);
        isCheckingRef.current = false;
        setIsInitialCheck(false);
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    };

    // Run check once immediately (if not already done)
    if (!checkedOnceRef.current) {
      checkedOnceRef.current = true;
      checkSession();
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[SessionCheck] Auth state changed:", event);
      
      // Check for pending subscription activation
      const pendingActivation = localStorage.getItem('pending_subscription_activation') === 'true';
      
      if (event === 'SIGNED_OUT' || !session) {
        if (!pendingActivation && location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
      // For sign-in events, don't automatically redirect to chat
      else if (event === 'SIGNED_IN') {
        // Handle pending subscription activation if needed
        if (pendingActivation) {
          console.log("[SessionCheck] Detected pending subscription activation after sign in");
          localStorage.removeItem('pending_subscription_activation');
          
          // Use the saved subscription data to update user profile
          localStorage.setItem('subscription_activated', 'true');
          
          // Wait briefly then call checkSession again to process the post-payment flow
          setTimeout(checkSession, 1000);
        }
        // *** IMPORTANT CHANGE: Don't redirect on sign-in to avoid loops ***
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname, isInitialCheck]);

  return null;
}
