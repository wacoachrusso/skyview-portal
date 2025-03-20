import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

interface AuthCallbackProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const handleStripeCheckout = async (priceId: string, email?: string) => {
  console.log('Creating checkout session for plan:', priceId);
  
  const { data: { session } } = await supabase.auth.getSession();
  const userEmail = email || session?.user.email;
  
  if (!userEmail) {
    throw new Error('User email not found');
  }
  
  // Get session token for additional security
  const sessionToken = localStorage.getItem('session_token');
  
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

  if (response.error) throw response.error;
  const { data: { url } } = response;
  
  if (url) {
    console.log('Redirecting to checkout:', url);
    window.location.href = url;
    return true;
  }
  return false;
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
    console.log('Free plan user, redirecting to dashboard');
    toast({
      title: "Login Successful",
      description: "You've been signed in. Any other active sessions have been signed out for security."
    });
    navigate('/chat');
    return;
  }

  // Handle paid plan checkout
  console.log('Paid plan user, redirecting to checkout');
  const priceId = profile.subscription_plan === 'monthly'
    ? 'price_1QcfUFA8w17QmjsPe9KXKFpT'
    : 'price_1QcfWYA8w17QmjsPZ22koqjj';

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
      ? 'price_1QcfUFA8w17QmjsPe9KXKFpT' 
      : 'price_1QcfWYA8w17QmjsPZ22koqjj';

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
      navigate('/dashboard');
      return true;
    }
  }
  return false;
};
