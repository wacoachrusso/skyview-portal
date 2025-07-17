import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";
import { useSessionStore } from "@/stores/session";

interface AuthCallbackProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const handleStripeCheckout = async (priceId: string, email?: string) => {
  console.log('Creating checkout session for plan:', priceId);
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error in handleStripeCheckout:', sessionError);
    throw new Error('Authentication error. Please log in again.');
  }
  
  if (!session) {
    console.error('No session found in handleStripeCheckout');
    throw new Error('Authentication required. Please log in.');
  }
  
  const userEmail = email || session?.user.email;
  
  if (!userEmail) {
    console.error('User email not found in handleStripeCheckout');
    throw new Error('User email not found. Please update your profile.');
  }
  
  // Get session token from store for additional security
  const store = useSessionStore.getState();
  const sessionToken = store.sessionToken || '';
  console.log('Session token available in handleStripeCheckout:', !!sessionToken);
  
  const response = await supabase.functions.invoke('create-checkout-session', {
    body: JSON.stringify({
      priceId,
      mode: 'subscription',
      email: userEmail,
      sessionToken,
    }),
    headers: session ? {
      Authorization: `Bearer ${session.access_token}`
    } : undefined
  });

  if (response.error) {
    console.error('Error in handleStripeCheckout:', response.error);
    throw new Error(response.error.message || 'Failed to create checkout session');
  }
  
  const { data } = response;
  const url = data?.url;
  
  if (url) {
    console.log('Redirecting to checkout from handleStripeCheckout:', url);
    window.location.href = url;
    return true;
  }
  
  console.error('No checkout URL received in handleStripeCheckout:', data);
  throw new Error('No checkout URL received from payment processor');
};

export const handleProfileRedirect = async (
  profile: any,
  selectedPlan: string | null,
  { navigate, toast }: AuthCallbackProps
) => {
  if (!profile.user_type || !profile.airline) {
    console.log('Profile incomplete, redirecting to complete profile');
    navigate('/complete-profile');
    return;
  }

  if (profile.subscription_plan === 'free') {
    console.log('Free plan user, redirecting to chat');
    toast({
      title: "Login Successful",
      description: "You've been signed in. Any other active sessions have been signed out for security."
    });
    navigate('/chat');
    return;
  }

  // Handle paid plan checkout with updated price IDs
  console.log('Paid plan user, redirecting to checkout');
  const priceId = profile.subscription_plan === 'monthly'
    ? 'price_1QxETHA8w17QmjsPS1R3bhj8'  // Updated monthly price ID
    : 'price_1QxETwA8w17QmjsP9tnCgLAx';  // Updated annual price ID

  try {
    await handleStripeCheckout(priceId);
  } catch (error) {
    throw new Error('Failed to create checkout session');
  }
};

export const handleSelectedPlan = async (
  selectedPlan: string | null,
  { navigate, toast }: AuthCallbackProps
) => {
  if (selectedPlan && selectedPlan !== 'free') {
    const priceId = selectedPlan.toLowerCase() === 'monthly' 
      ? 'price_1QxETHA8w17QmjsPS1R3bhj8'  // Updated monthly price ID
      : 'price_1QxETwA8w17QmjsP9tnCgLAx';  // Updated annual price ID

    try {
      const success = await handleStripeCheckout(priceId);
      if (!success) {
        throw new Error('No checkout URL received');
      }
      return true;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      });
      // Redirect to chat instead of dashboard
      navigate('/chat');
      return true;
    }
  }
  return false;
};