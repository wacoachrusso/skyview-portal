
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";
import { createNewSession } from "@/services/session/createSession";

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
  console.log("StripeCallback: Processing payment callback with session ID:", sessionId);
  
  try {
    // Set a flag to indicate payment processing in progress
    localStorage.setItem('payment_in_progress', 'true');
    
    // IMPORTANT: First restore auth state from localStorage if available
    const savedAccessToken = localStorage.getItem('auth_access_token');
    const savedRefreshToken = localStorage.getItem('auth_refresh_token');
    const savedUserId = localStorage.getItem('auth_user_id');
    const savedEmail = localStorage.getItem('auth_user_email');
    
    let authRestored = false;
    
    if (savedAccessToken && savedRefreshToken) {
      console.log("StripeCallback: Found saved auth tokens, attempting to restore session");
      
      // Try to restore the session with the saved tokens
      const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
        access_token: savedAccessToken,
        refresh_token: savedRefreshToken
      });
      
      if (restoreError) {
        console.error("StripeCallback: Error restoring session from saved tokens:", restoreError);
        
        // If we have the user ID, try alternate method - sign in with refresh token
        if (savedUserId) {
          console.log("StripeCallback: Attempting alternate session restoration method");
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("StripeCallback: Alternate session restoration failed:", refreshError);
          } else {
            authRestored = true;
            console.log("StripeCallback: Successfully restored session via refresh method");
          }
        }
      } else if (sessionData.session) {
        authRestored = true;
        console.log("StripeCallback: Successfully restored session from saved tokens");
      }
    }
    
    // Check if user is now logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("StripeCallback: Session check result:", { 
      hasSession: !!session,
      error: sessionError 
    });

    if (sessionError) {
      console.error("StripeCallback: Session error during callback:", sessionError);
      throw new Error("Authentication error. Please try logging in again.");
    }

    if (session?.user) {
      console.log("StripeCallback: User is authenticated:", session.user.email);
      
      try {
        // Update subscription status in profile after successful payment
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            // Determine plan type from session data or localStorage
            subscription_plan: localStorage.getItem('selected_plan') || 
              (sessionId.includes('monthly') ? 'monthly' : 'annual')
          })
          .eq('id', session.user.id);
        
        if (updateError) {
          console.error("StripeCallback: Error updating subscription status:", updateError);
        } else {
          console.log("StripeCallback: Successfully updated subscription status");
        }
        
        // Create a new session token for this user
        await createNewSession(session.user.id);
        console.log("StripeCallback: Created new session token after payment");
        
        // Set tokens in cookies for added persistence
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        
        // Set flags for post-payment state
        localStorage.setItem('subscription_activated', 'true');
        
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated. Welcome to SkyGuide!",
        });
        
        // CRITICAL: Force a full page reload to the chat page for clean state
        window.location.href = `${window.location.origin}/chat`;
        return null;
      } catch (error) {
        console.error("StripeCallback: Error in subscription activation:", error);
        // If anything fails, explicitly redirect to chat with forced reload
        window.location.href = `${window.location.origin}/chat`;
        return null;
      }
    }

    // For users who aren't already logged in, handle pending signup
    let pendingSignup = null;
    let pendingSignupError = null;
    
    for (let i = 0; i < 3; i++) {
      console.log(`StripeCallback: Attempt ${i + 1}: Fetching pending signup data for session:`, sessionId);
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
        console.log("StripeCallback: Retrying pending signup fetch in 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log("StripeCallback: Final pending signup query result:", { 
      hasPendingSignup: !!pendingSignup,
      pendingSignupEmail: pendingSignup?.email,
      error: pendingSignupError 
    });

    if (pendingSignupError) {
      console.error("StripeCallback: Error fetching pending signup:", pendingSignupError);
      throw new Error("Failed to fetch signup data. Please contact support.");
    }

    if (!pendingSignup) {
      console.error("StripeCallback: No pending signup found for session:", sessionId);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "Your signup data was not found. Please try signing up again or contact support if the issue persists."
      });
      localStorage.removeItem('payment_in_progress');
      navigate('/?scrollTo=pricing-section', { replace: true });
      return null;
    }

    return pendingSignup as PendingSignup;
  } catch (error) {
    console.error("StripeCallback: Unexpected error:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "An unexpected error occurred. Please try again or contact support."
    });
    localStorage.removeItem('payment_in_progress');
    navigate('/login');
    return null;
  }
};
