import { supabase } from "@/integrations/supabase/client";

interface StripeCheckoutParams {
  priceId: string;
  email: string;
}

export const createStripeCheckoutSession = async ({ priceId, email }: StripeCheckoutParams) => {
  console.log('Creating checkout session for:', { priceId, email });
  
  const response = await supabase.functions.invoke('create-checkout-session', {
    body: JSON.stringify({
      priceId: priceId,
      mode: 'subscription',
      email: email.trim().toLowerCase(),
    }),
  });

  if (response.error) {
    console.error('Error creating checkout session:', response.error);
    throw new Error(response.error.message);
  }

  const { data: { url } } = response;
  if (!url) {
    throw new Error('No checkout URL received');
  }

  return url;
};