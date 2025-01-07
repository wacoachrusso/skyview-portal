import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePricingHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlanSelection = async (plan: any) => {
    try {
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
        window.location.href = '/signup';
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

      // Get fresh session token
      const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        throw new Error('Failed to refresh authentication');
      }

      if (!freshSession) {
        throw new Error('No valid session found');
      }

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        throw new Error('No session token found');
      }

      const response = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          priceId: plan.priceId,
          mode: plan.mode,
          sessionToken
        }),
        headers: {
          Authorization: `Bearer ${freshSession.access_token}`
        }
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