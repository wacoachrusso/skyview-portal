
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";

export const usePricingCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = async (
    name: string,
    priceId: string,
    mode: 'subscription' | 'payment',
    onSelect?: () => Promise<void>
  ) => {
    if (onSelect) {
      try {
        await onSelect();
      } catch (error: any) {
        console.error('Custom onSelect handler error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to process custom selection. Please try again.",
        });
      }
      return;
    }

    try {
      console.log('Starting plan selection in usePricingCard for:', name);
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in usePricingCard:', sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to continue.",
        });
        navigate('/login', { state: { returnTo: 'pricing' } });
        return;
      }
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', name.toLowerCase());
        navigate('/signup', { 
          state: { 
            selectedPlan: name.toLowerCase(),
            priceId,
            mode
          }
        });
        return;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        console.error('User email not found in session:', session);
        throw new Error('User email not found. Please update your profile.');
      }

      // Get session token for additional security
      const sessionToken = localStorage.getItem('session_token') || '';
      
      // Call the utility function to create checkout session
      try {
        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: userEmail,
          sessionToken
        });
        
        console.log('Redirecting to checkout URL from usePricingCard:', checkoutUrl);
        window.location.href = checkoutUrl;
      } catch (error: any) {
        console.error('Error in createStripeCheckoutSession from usePricingCard:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error in usePricingCard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process plan selection. Please try again.",
      });
    }
  };

  return { handlePlanSelection };
};
