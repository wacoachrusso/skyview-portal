import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";
import { useErrorState } from "@/hooks/useErrorState";

interface PlanSelectionProps {
  name: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  returnUrl?: string;
}

export const usePricingHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorState();

  const handlePlanSelection = async ({
    name,
    priceId,
    mode,
    returnUrl = '/chat'
  }: PlanSelectionProps) => {
    // Store a timestamp to measure performance
    const startTime = Date.now();
    let processingToast: any = null;

    try {
      console.log('Starting plan selection in usePricingHandler for:', name, 'with priceId:', priceId);
      
      // Show processing toast immediately with longer duration
      processingToast = toast({
        variant: "default",
        title: "Processing",
        description: "Preparing your checkout session...",
        duration: 300000, // 5 minutes
      });
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error in usePricingHandler:', sessionError);
        processingToast?.dismiss();
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to continue.",
        });
        
        // Set a return URL to come back to after login
        navigate('/login', { 
          state: { 
            redirectTo: window.location.pathname,
            selectedPlan: name.toLowerCase(),
            priceId,
            mode 
          } 
        });
        return;
      }
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', name.toLowerCase());
        processingToast?.dismiss();
        
        // Include more detailed info in the state
        navigate('/signup', { 
          state: { 
            selectedPlan: name.toLowerCase(),
            priceId,
            mode,
            redirectTo: window.location.pathname
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
        navigate('/login', { 
          state: { 
            redirectTo: window.location.pathname,
            selectedPlan: name.toLowerCase(),
            priceId,
            mode
          } 
        });
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
        navigate('/login', { state: { redirectTo: window.location.pathname } });
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
      
      // Set flag to indicate a payment is in progress
      localStorage.setItem("payment_in_progress", "true");
      
      // Build success URL with payment success flag
      const successUrl = `${window.location.origin}${returnUrl}?payment_success=true&source=pricing`;
      
      // Call the utility function to create checkout session
      try {
        console.log('Creating checkout session with priceId:', priceId);
        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: userEmail,
          sessionToken,
          successUrl // Pass the success URL
        });
        
        // Measure how long it took to create the checkout session
        const processingTime = Date.now() - startTime;
        console.log(`Checkout session created in ${processingTime}ms`);
        
        processingToast?.dismiss();
        console.log('Redirecting to checkout URL from usePricingHandler:', checkoutUrl);
        
        // Add a small delay before redirect to ensure toast is dismissed
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 500);
      } catch (error: any) {
        localStorage.removeItem("payment_in_progress");
        processingToast?.dismiss();
        console.error('Error in createStripeCheckoutSession from usePricingHandler:', error);
        
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
          navigate('/login', { state: { redirectTo: window.location.pathname } });
        } else if (error.message?.includes('network') || error.message?.includes('timed out')) {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Network error. Please check your connection and try again.",
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
      localStorage.removeItem("payment_in_progress");
      processingToast?.dismiss();
      console.error('Error in usePricingHandler:', error);
      
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