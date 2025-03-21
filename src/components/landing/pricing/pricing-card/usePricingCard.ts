
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in usePricingCard:', sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again to continue.",
        });
        navigate('/login');
        return;
      }
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', {
          name: name.toLowerCase(),
          priceId,
          mode
        });
        
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
      console.log('Session token available in usePricingCard:', !!sessionToken);

      console.log('Making request to create-checkout-session from usePricingCard with:', {
        priceId,
        mode,
        email: userEmail,
        hasSessionToken: !!sessionToken
      });

      // Make the request to create a checkout session
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          priceId,
          mode,
          email: userEmail,
          sessionToken
        }),
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Checkout session response in usePricingCard:', response);

      if (response.error) {
        console.error('Error from checkout session in usePricingCard:', response.error);
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      const { data } = response;
      
      if (data?.url) {
        console.log('Redirecting to checkout URL from usePricingCard:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received in usePricingCard:', data);
        throw new Error('No checkout URL received from payment processor');
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
