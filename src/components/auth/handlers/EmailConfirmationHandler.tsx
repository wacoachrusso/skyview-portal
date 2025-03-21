
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
        
        if (savedAccessToken && savedRefreshToken) {
          console.log("Found saved auth tokens, attempting to restore session");
          
          // Try to restore the session with the saved tokens
          const { data: sessionData, error: restoreError } = await supabase.auth.setSession({
            access_token: savedAccessToken,
            refresh_token: savedRefreshToken
          });
          
          if (restoreError) {
            console.error("Error restoring session from saved tokens:", restoreError);
          } else if (sessionData.session) {
            console.log("Successfully restored session from saved tokens");
          }
          
          // Clean up saved tokens regardless of outcome
          localStorage.removeItem('auth_access_token');
          localStorage.removeItem('auth_refresh_token');
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
                ...(localStorage.getItem('selected_plan') && {
                  subscription_plan: localStorage.getItem('selected_plan')
                })
              })
              .eq('id', session.user.id);
              
            if (updateError) {
              console.error("Error updating profile after payment:", updateError);
            } else {
              console.log("Profile updated with subscription status: active");
            }
            
            // Clean up localStorage
            localStorage.removeItem('postPaymentConfirmation');
            localStorage.removeItem('selected_plan');
            localStorage.removeItem('payment_in_progress');
            
            // Set flag to show welcome message in app
            localStorage.setItem('subscription_activated', 'true');
            
            toast({
              title: "Welcome to SkyGuide",
              description: "Your account is now ready to use with full access.",
            });
            
            // Always navigate directly to chat after payment
            navigate('/chat', { replace: true });
          } catch (error) {
            console.error("Error in post-payment processing:", error);
            toast({
              title: "Welcome to SkyGuide",
              description: "Your account is now ready to use.",
            });
            navigate('/chat', { replace: true });
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
