import { useEffect } from "react";
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sendWelcomeEmail } from "@/utils/email";

const AuthCallback = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Check if this is a post-payment callback
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');

      if (paymentStatus === 'success') {
        // Get pending signup data
        const pendingSignupStr = localStorage.getItem('pendingSignup');
        if (!pendingSignupStr) {
          console.error('No pending signup data found');
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not complete signup. Please try again.",
          });
          navigate('/signup');
          return;
        }

        try {
          const pendingSignup = JSON.parse(pendingSignupStr);
          
          // Create the user account
          const { data, error } = await supabase.auth.signUp({
            email: pendingSignup.email,
            password: pendingSignup.password,
            options: {
              data: {
                full_name: pendingSignup.fullName,
                user_type: pendingSignup.jobTitle,
                airline: pendingSignup.airline,
                subscription_plan: pendingSignup.plan,
              },
            },
          });

          if (error) throw error;

          // Send welcome email after successful signup
          await sendWelcomeEmail({
            email: pendingSignup.email,
            name: pendingSignup.fullName,
          });

          // Clear pending signup data
          localStorage.removeItem('pendingSignup');

          toast({
            title: "Success",
            description: "Your account has been created and payment processed successfully!",
          });
          
          navigate('/dashboard');
        } catch (error) {
          console.error('Error completing signup:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to complete signup. Please contact support.",
          });
          navigate('/signup');
        }
      } else if (paymentStatus === 'cancelled') {
        localStorage.removeItem('pendingSignup');
        toast({
          variant: "destructive",
          title: "Payment Cancelled",
          description: "Your payment was cancelled. Please try again.",
        });
        navigate('/signup');
      } else {
        // Handle regular auth callback
        const { handleCallback } = useAuthCallback();
        await handleCallback();
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return null;
};

export default AuthCallback;