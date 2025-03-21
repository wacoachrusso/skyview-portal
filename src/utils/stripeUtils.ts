
import { supabase } from "@/integrations/supabase/client";

interface StripeCheckoutParams {
  priceId: string;
  email: string;
  sessionToken?: string;
}

export const createStripeCheckoutSession = async ({ priceId, email, sessionToken }: StripeCheckoutParams) => {
  console.log('Creating checkout session for:', { priceId, email, hasSessionToken: !!sessionToken });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('No active session found when creating checkout');
    throw new Error('Authentication required. Please log in before proceeding.');
  }
  
  const authHeader = session ? { Authorization: `Bearer ${session.access_token}` } : {};
  
  console.log('Invoking create-checkout-session with auth header:', !!authHeader.Authorization);
  
  const response = await supabase.functions.invoke('create-checkout-session', {
    body: JSON.stringify({
      priceId: priceId,
      mode: 'subscription',
      email: email.trim().toLowerCase(),
      sessionToken: sessionToken || ''
    }),
    headers: authHeader
  });

  if (response.error) {
    console.error('Error creating checkout session:', response.error);
    throw new Error(response.error.message || 'Failed to create checkout session');
  }

  const { data } = response;
  
  if (!data?.url) {
    console.error('No checkout URL received:', data);
    throw new Error('No checkout URL received from payment processor');
  }

  console.log('Successfully created checkout session, redirecting to:', data.url);
  return data.url;
};
