import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePricingHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlanSelection = async (plan: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', plan.name);
        navigate('/signup', { 
          state: { 
            selectedPlan: plan.name.toLowerCase(),
            priceId: plan.priceId
          }
        });
        return;
      }

      if (!plan.priceId) {
        window.location.href = '/signup';
        return;
      }

      console.log('Making request to create-checkout-session with:', {
        session: session.access_token,
        priceId: plan.priceId,
        mode: plan.mode
      });
      
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          priceId: plan.priceId,
          mode: plan.mode,
        }),
      });

      console.log('Checkout session response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data: { url } } = response;
      
      if (url) {
        window.location.href = url;
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