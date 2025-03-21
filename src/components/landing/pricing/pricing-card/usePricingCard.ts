
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";
import { useErrorState } from "@/hooks/useErrorState";

export const usePricingCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorState();

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

    // Store a timestamp to measure performance
    const startTime = Date.now();
    let processingToast: any = null;

    try {
      console.log('Starting plan selection in usePricingCard for:', name, 'with priceId:', priceId);
      
      // Show processing toast immediately with longer duration (90 seconds)
      processingToast = toast({
        variant: "default",
        title: "Processing",
        description: "Preparing your checkout session...",
        duration: 90000, // 90 seconds
      });
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in usePricingCard:', sessionError);
        processingToast?.dismiss();
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
        processingToast?.dismiss();
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
        processingToast?.dismiss();
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
        processingToast?.dismiss();
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
        processingToast?.dismiss();
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
        
        // Measure how long it took to create the checkout session
        const processingTime = Date.now() - startTime;
        console.log(`Checkout session created in ${processingTime}ms`);
        
        processingToast?.dismiss();
        console.log('Redirecting to checkout URL from usePricingCard:', checkoutUrl);
        
        // Add a small delay before redirect to ensure toast is dismissed
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 500);
      } catch (error: any) {
        processingToast?.dismiss();
        console.error('Error in createStripeCheckoutSession from usePricingCard:', error);
        
        // Customize error message based on error type
        if (error.message?.includes('Authentication') || 
            error.message?.includes('session') || 
            error.message?.includes('token') || 
            error.message?.includes('log in')) {
          
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Authentication required. Please log in and try again.",
          });
          navigate('/login', { state: { returnTo: 'pricing' } });
        } else if (error.message?.includes('network')) {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Network error. Please check your connection and try again.",
          });
        } else if (error.message?.includes('payment service') || 
                  error.message?.includes('unavailable') || 
                  error.message?.includes('try again later')) {
          
          toast({
            variant: "destructive",
            title: "Service Unavailable",
            description: "The payment service is currently unavailable. Please try again later or contact support.",
          });
        } else if (error.message?.includes('Edge Function') || 
                  error.message?.includes('non-2xx status code')) {
          
          toast({
            variant: "destructive",
            title: "Service Error",
            description: "The payment service is experiencing technical difficulties. Please try again later.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to process plan selection. Please try again.",
          });
        }
        
        // Log additional details for debugging
        handleError(error);
      }
    } catch (error: any) {
      processingToast?.dismiss();
      console.error('Error in usePricingCard:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process plan selection. Please try again.",
      });
      
      // Log additional details for debugging
      handleError(error);
    }
  };

  return { handlePlanSelection };
};
