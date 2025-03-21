
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createNewSession } from "@/services/session/createSession";

export const EmailConfirmationHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndPayment = async () => {
      try {
        console.log("Email confirmation handler running");
        
        // First check for saved auth tokens (from payment flow)
        const savedAccessToken = localStorage.getItem('auth_access_token');
        const savedRefreshToken = localStorage.getItem('auth_refresh_token');
        const savedUserId = localStorage.getItem('auth_user_id');
        const savedEmail = localStorage.getItem('auth_user_email');
        
        let authRestored = false;
        
        if (savedAccessToken && savedRefreshToken) {
          console.log("Found saved auth tokens, attempting to restore session");
          
          // Try to restore the session with the saved tokens
          const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
            access_token: savedAccessToken,
            refresh_token: savedRefreshToken
          });
          
          if (restoreError) {
            console.error("Error restoring session from saved tokens:", restoreError);
            
            // If we have the user ID, try alternate method
            if (savedUserId && savedEmail) {
              console.log("Attempting alternate session restoration with user ID:", savedUserId);
              // Try refreshing the session
              const { error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError) {
                authRestored = true;
                console.log("Successfully restored session via refresh method");
              }
            }
          } else if (sessionData.session) {
            authRestored = true;
            console.log("Successfully restored session from saved tokens");
            
            // If post-payment confirmation, update subscription status immediately
            const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
            if (isPostPayment && sessionData.session.user.id) {
              // Update user's profile to mark subscription as active
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  subscription_status: 'active',
                  subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
                })
                .eq('id', sessionData.session.user.id);
                
              if (updateError) {
                console.error("Error updating profile after payment:", updateError);
              } else {
                console.log("Profile updated with subscription status: active");
              }
            }
          }
          
          // Clean up saved tokens regardless of outcome
          localStorage.removeItem('auth_access_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user_id');
          localStorage.removeItem('auth_user_email');
        }
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error in EmailConfirmationHandler:", sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please try logging in again."
          });
          navigate('/login');
          return;
        }
        
        if (!session?.user) {
          console.log("No user session found, redirecting to login");
          navigate('/login');
          return;
        }

        console.log("User authenticated:", session.user.email);

        // Check if this is a post-payment confirmation
        const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
        console.log("Is post-payment confirmation:", isPostPayment);
        
        if (isPostPayment) {
          try {
            // Create a new session token for this user
            await createNewSession(session.user.id);
            console.log("Created new session token after email confirmation");
            
            // Update user's profile to mark subscription as active
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                subscription_status: 'active',
                // If we know the plan type from localStorage
                subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
              })
              .eq('id', session.user.id);
              
            if (updateError) {
              console.error("Error updating profile after payment:", updateError);
            } else {
              console.log("Profile updated with subscription status: active");
            }
            
            // Set cookies for additional persistence
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
            document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
            document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
            
            // Clean up localStorage
            localStorage.removeItem('postPaymentConfirmation');
            localStorage.removeItem('selected_plan');
            localStorage.removeItem('payment_in_progress');
            
            // Set flag to show welcome message in app and identify post-payment state
            localStorage.setItem('subscription_activated', 'true');
            
            toast({
              title: "Welcome to SkyGuide",
              description: "Your account is now ready to use with full access.",
            });
            
            // Force a full page reload to ensure clean application state
            window.location.href = `${window.location.origin}/chat`;
            return;
          } catch (error) {
            console.error("Error in post-payment processing:", error);
            toast({
              title: "Welcome to SkyGuide",
              description: "Your account is now ready to use.",
            });
            // Fall back to direct navigation if needed
            window.location.href = `${window.location.origin}/chat`;
            return;
          }
        } else {
          // Non-payment related email confirmation, go to dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Unexpected error in EmailConfirmationHandler:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try logging in again."
        });
        navigate('/login');
      }
    };

    checkAuthAndPayment();
  }, [navigate, toast]);

  return null;
};
