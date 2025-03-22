
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  shouldSkipChecks,
  handlePostPaymentRedirect,
  handleSubscriptionActivation,
  checkSessionExists,
  checkUserStatus,
  getSessionWithFallbacks
} from "@/utils/session/sessionRedirectHandlers";

export const useSessionCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isCheckingRef = useRef(false);
  const checkedOnceRef = useRef(false);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  const checkSession = async () => {
    // Prevent concurrent checks and redundant checks
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    
    try {
      console.log("[SessionCheck] Checking session status...");
      
      // Skip checks if we're in a special case
      if (shouldSkipChecks(location)) {
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
      
      // MOST CRITICAL CHECK: First check for post-payment state
      // This must override all other checks
      const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
      const isNewUserSignup = localStorage.getItem('new_user_signup') === 'true';
      
      // Handle post-payment redirects
      const redirectHandled = await handlePostPaymentRedirect(
        isPostPayment, 
        isNewUserSignup, 
        location, 
        navigate
      );
      
      if (redirectHandled) {
        isCheckingRef.current = false;
        setIsInitialCheck(false);
        return;
      }
      
      if (isPostPayment) {
        // Get the current session - try multiple methods for maximum reliability
        const session = await getSessionWithFallbacks();
          
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
        
        // If we have a session, handle the subscription activation
        await handleSubscriptionActivation(session?.user?.id, navigate);
        isCheckingRef.current = false;
        setIsInitialCheck(false);
        return;
      }

      // For non-payment flows: Regular session check
      const { session, exists } = await checkSessionExists(location, navigate, toast);
      
      if (!exists) {
        isCheckingRef.current = false;
        setIsInitialCheck(false);
        return;
      }

      // Check user status and handle any needed redirects
      const statusHandled = await checkUserStatus(
        session.user.id,
        location,
        navigate,
        isInitialCheck,
        toast
      );
      
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

  useEffect(() => {
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
};

export default useSessionCheck;
