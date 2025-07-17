import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";
import { createNewSession } from "@/services/session/createSession";
import { useSessionStore } from "@/stores/session";

interface PendingSignup {
  email: string;
  password: string;
  full_name: string;
  job_title: string;
  airline: string;
  plan: string;
  stripe_session_id: string;
}

export const handleStripeCallback = async (
  sessionId: string,
  navigate: NavigateFunction
) => {
  console.log("[stripeCallbackHandler] Processing payment callback with session ID:", sessionId);
  
  // Get store instance
  const store = useSessionStore.getState();
  
  try {
    // Set a flag to indicate payment processing in progress
    store.setPaymentInProgress(true);
    
    // CRITICAL STEP 1: Restore auth state from store if available
    let authRestored = false;
    const savedAccessToken = store.accessToken;
    const savedRefreshToken = store.refreshToken;
    
    if (savedAccessToken && savedRefreshToken) {
      console.log("[stripeCallbackHandler] Found saved auth tokens, attempting to restore session");
      
      // Try to restore the session with the saved tokens - multiple methods for redundancy
      
      // Method 1: Use setSession
      try {
        console.log("[stripeCallbackHandler] Restoration method 1: setSession");
        const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
          access_token: savedAccessToken,
          refresh_token: savedRefreshToken
        });
        
        if (restoreError) {
          console.error("[stripeCallbackHandler] Error in method 1:", restoreError);
        } else if (sessionData.session) {
          authRestored = true;
          console.log("[stripeCallbackHandler] Successfully restored session via method 1");
        }
      } catch (error) {
        console.error("[stripeCallbackHandler] Exception in method 1:", error);
      }
      
      // Method 2: Use refreshSession if method 1 failed
      if (!authRestored) {
        try {
          console.log("[stripeCallbackHandler] Restoration method 2: refreshSession");
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("[stripeCallbackHandler] Error in method 2:", refreshError);
          } else if (data.session) {
            authRestored = true;
            console.log("[stripeCallbackHandler] Successfully restored session via method 2");
          }
        } catch (error) {
          console.error("[stripeCallbackHandler] Exception in method 2:", error);
        }
      }
      
      // Method 3: Try cookie-based restoration if other methods failed
      if (!authRestored) {
        try {
          console.log("[stripeCallbackHandler] Restoration method 3: cookies");
          
          // Try to get tokens from cookies
          const getCookie = (name: string) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
          };
          
          const cookieAccessToken = getCookie('sb-access-token');
          const cookieRefreshToken = getCookie('sb-refresh-token');
          
          if (cookieAccessToken && cookieRefreshToken) {
            console.log("[stripeCallbackHandler] Found cookie tokens, attempting restoration");
            const { data: cookieData, error: cookieError } = await supabase.auth.setSession({
              access_token: cookieAccessToken,
              refresh_token: cookieRefreshToken
            });
            
            if (cookieError) {
              console.error("[stripeCallbackHandler] Error in method 3:", cookieError);
            } else if (cookieData.session) {
              authRestored = true;
              console.log("[stripeCallbackHandler] Successfully restored session via method 3");
            }
          }
        } catch (error) {
          console.error("[stripeCallbackHandler] Exception in method 3:", error);
        }
      }
    }
    
    // CRITICAL STEP 2: Check if user is now logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("[stripeCallbackHandler] Session check result:", { 
      hasSession: !!session,
      sessionUser: session?.user?.email,
      authRestored,
      error: sessionError ? true : false
    });

    if (sessionError) {
      console.error("[stripeCallbackHandler] Session error during callback:", sessionError);
      throw new Error("Authentication error. Please try logging in again.");
    }

    if (session?.user) {
      console.log("[stripeCallbackHandler] User is authenticated:", session.user.email);
      
      try {
        // CRITICAL STEP 3: Update subscription status in profile after payment (handled in Authcallback stripe-set-session)
        // CRITICAL STEP 4: Create a new session token for this user
        try {
          await createNewSession(session.user.id);
          console.log("[stripeCallbackHandler] Created new session token after payment");
        } catch (sessionErr) {
          console.error("[stripeCallbackHandler] Error creating session token:", sessionErr);
          // Non-critical error, continue
        }
        
        // CRITICAL STEP 5: Update store with auth tokens and user info
        store.setAuthTokens(session.access_token, session.refresh_token);
        store.setUserId(session.user.id);
        store.setUserEmail(session.user.email || null);
        
        // Set tokens in cookies for added persistence
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        
        // CRITICAL STEP 6: Set flag for post-payment state
        store.setSubscriptionActivated(true);
        store.setPostPaymentConfirmation(true);
        
        console.log("[stripeCallbackHandler] All critical post-payment steps completed successfully");
        
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated. Welcome to SkyGuide!",
          duration: 10000, // Show for 10 seconds
        });
        
        // CRITICAL STEP 7: Force a full page reload to the chat page for clean state
        // Add a short delay to ensure all state is properly updated
        console.log("[stripeCallbackHandler] Waiting before redirect to ensure state is updated");
        
        setTimeout(() => {
          console.log("[stripeCallbackHandler] Now redirecting to chat page");
          // Skip initial redirect since we're coming from payment
          store.setSkipInitialRedirect(true);
          window.location.href = `${window.location.origin}/chat`;
        }, 2000); // Increased delay to ensure all state is updated
        
        return null;
      } catch (error) {
        console.error("[stripeCallbackHandler] Error in subscription activation:", error);
        
        // If anything fails in the critical path, set the subscription flag anyway
        // and redirect to chat - better to give access and fix later than deny service
        store.setSubscriptionActivated(true);
        
        // Force a page reload to get a clean slate
        window.location.href = `${window.location.origin}/chat`;
        return null;
      }
    }

    // For users who aren't already logged in, handle pending signup
    let pendingSignup = null;
    let pendingSignupError = null;
    
    for (let i = 0; i < 3; i++) {
      console.log(`[stripeCallbackHandler] Attempt ${i + 1}: Fetching pending signup data for session:`, sessionId);
      const result = await supabase
        .from('pending_signups')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
      
      if (result.data) {
        pendingSignup = result.data;
        break;
      }
      
      pendingSignupError = result.error;
      if (i < 2) {
        console.log("[stripeCallbackHandler] Retrying pending signup fetch in 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log("[stripeCallbackHandler] Final pending signup query result:", { 
      hasPendingSignup: !!pendingSignup,
      pendingSignupEmail: pendingSignup?.email,
      error: pendingSignupError ? true : false
    });

    if (pendingSignupError) {
      console.error("[stripeCallbackHandler] Error fetching pending signup:", pendingSignupError);
      throw new Error("Failed to fetch signup data. Please contact support.");
    }

    if (!pendingSignup) {
      console.error("[stripeCallbackHandler] No pending signup found for session:", sessionId);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "Your signup data was not found. Please try signing up again or contact support if the issue persists.",
        duration: 10000,
      });
      store.setPaymentInProgress(false);
      navigate('/?scrollTo=pricing-section', { replace: true });
      return null;
    }

    return pendingSignup as PendingSignup;
  } catch (error) {
    console.error("[stripeCallbackHandler] Unexpected error:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "An unexpected error occurred. Please try again or contact support.",
      duration: 10000,
    });
    store.setPaymentInProgress(false);
    navigate('/login');
    return null;
  }
};