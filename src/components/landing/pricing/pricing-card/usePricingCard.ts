
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
      console.log('Starting plan selection in usePricingCard for:', name, 'with priceId:', priceId);
      
      // Show processing toast immediately with longer duration
      const processingToast = toast({
        variant: "default",
        title: "Processing",
        description: "Preparing your checkout session...",
        duration: 60000, // 60 seconds
      });
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in usePricingCard:', sessionError);
        processingToast.dismiss();
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
        processingToast.dismiss();
        navigate('/signup', { 
          state: { 
            selectedPlan: name.toLowerCase(),
            priceId,
            mode
          }
        });
        return;
      }

      // Force a session refresh to ensure we have a fresh token
      console.log('Refreshing session before checkout');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        processingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Failed to refresh your session. Please log in again.",
        });
        navigate('/login', { state: { returnTo: 'pricing' } });
        return;
      }

      // Get updated session data
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      if (!refreshedSession) {
        console.error('No session after refresh');
        processingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Could not retrieve your session. Please log in again.",
        });
        navigate('/login', { state: { returnTo: 'pricing' } });
        return;
      }

      const userEmail = refreshedSession.user.email;
      if (!userEmail) {
        console.error('User email not found in session:', refreshedSession);
        processingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Error",
          description: "User email not found. Please update your profile.",
        });
        return;
      }

      // Get session token for additional security
      const sessionToken = localStorage.getItem('session_token') || refreshedSession.refresh_token || '';
      
      // Call the utility function to create checkout session
      try {
        console.log('Creating checkout session with priceId:', priceId);
        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: userEmail,
          sessionToken
        });
        
        processingToast.dismiss();
        console.log('Redirecting to checkout URL from usePricingCard:', checkoutUrl);
        window.location.href = checkoutUrl;
      } catch (error: any) {
        processingToast.dismiss();
        console.error('Error in createStripeCheckoutSession from usePricingCard:', error);
        
        let errorMessage = "Failed to process plan selection. Please try again.";
        
        // Customize error message based on error type
        if (error.message?.includes('Authentication') || 
            error.message?.includes('session') || 
            error.message?.includes('token') || 
            error.message?.includes('log in')) {
          errorMessage = "Authentication required. Please log in and try again.";
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: errorMessage,
          });
          navigate('/login', { state: { returnTo: 'pricing' } });
        } else if (error.message?.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: errorMessage,
          });
        } else if (error.message?.includes('2xx') || error.message?.includes('edge function')) {
          toast({
            variant: "destructive",
            title: "Server Error",
            description: "The payment service is currently unavailable. Please try again later or contact support.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || errorMessage,
          });
        }
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
