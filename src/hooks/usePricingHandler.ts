import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePricingHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlanSelection = async (plan: any) => {
    try {
      console.log('Starting plan selection process for:', plan);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error');
      }
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', {
          name: plan.name,
          priceId: plan.priceId,
          mode: plan.mode
        });
        
        navigate('/signup', { 
          state: { 
            selectedPlan: plan.name.toLowerCase(),
            priceId: plan.priceId,
            mode: plan.mode
          }
        });
        return;
      }

      if (!plan.priceId) {
        console.log('No priceId provided, redirecting to signup');
        navigate('/signup');
        return;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error('User email not found');
      }

      console.log('Making request to create-checkout-session with:', {
        priceId: plan.priceId,
        mode: plan.mode,
        email: userEmail
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          mode: plan.mode
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Checkout session response:', data);

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      });
    }
  };

  return { handlePlanSelection };
};