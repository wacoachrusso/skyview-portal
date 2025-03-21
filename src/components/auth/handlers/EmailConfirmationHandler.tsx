
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Check if this is a post-payment confirmation
      const isPostPayment = localStorage.getItem('postPaymentConfirmation') === 'true';
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
          }
          
          // Clean up localStorage
          localStorage.removeItem('postPaymentConfirmation');
          localStorage.removeItem('selected_plan');
          
          // Set flag to show welcome message in app
          localStorage.setItem('subscription_activated', 'true');
          
          toast({
            title: "Welcome to SkyGuide",
            description: "Your account is now ready to use with full access.",
          });
          
          navigate('/chat');
        } catch (error) {
          console.error("Error in post-payment processing:", error);
          toast({
            title: "Welcome to SkyGuide",
            description: "Your account is now ready to use.",
          });
          navigate('/chat');
        }
      } else {
        navigate('/dashboard');
      }
    };

    checkAuthAndPayment();
  }, [navigate, toast]);

  return null;
};
