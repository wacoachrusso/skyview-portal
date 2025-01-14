import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

interface AuthCallbackProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const handleStripeCheckout = async (priceId: string) => {
  console.log('Creating checkout session for plan:', priceId);
  
  const response = await supabase.functions.invoke('create-checkout-session', {
    body: JSON.stringify({
      priceId,
      mode: 'subscription',
    }),
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
  // Always check subscription status first
  if (!profile.subscription_plan || profile.subscription_plan === 'free') {
    console.log('No valid subscription found, redirecting to pricing');
    await supabase.auth.signOut();
    toast({
      title: "Subscription Required",
      description: "Please select a subscription plan to continue."
    });
    navigate('/?scrollTo=pricing-section');
    return;
  }

  // If they have a valid subscription, proceed to dashboard
  console.log('Valid subscription found, redirecting to dashboard');
  toast({
    title: "Welcome back!",
    description: "You've been successfully signed in."
  });
  navigate('/dashboard');
};

export const handleSelectedPlan = async (
  selectedPlan: string | null,
  { navigate, toast }: AuthCallbackProps
) => {
  if (!selectedPlan) return false;

  console.log('Handling selected plan:', selectedPlan);

  try {
    if (selectedPlan.toLowerCase() !== 'free') {
      const priceId = selectedPlan.toLowerCase() === 'monthly' 
        ? 'price_1QcfUFA8w17QmjsPe9KXKFpT' 
        : 'price_1QcfWYA8w17QmjsPZ22koqjj';

      // Always redirect to Stripe checkout for paid plans
      const success = await handleStripeCheckout(priceId);
      if (!success) {
        throw new Error('Failed to create checkout session');
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error handling selected plan:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to process subscription. Please try again.",
    });
    // Sign out and redirect to pricing on error
    await supabase.auth.signOut();
    navigate('/?scrollTo=pricing-section');
    return true;
  }
};