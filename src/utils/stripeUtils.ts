
import { supabase } from "@/integrations/supabase/client";

interface StripeCheckoutParams {
  priceId: string;
  email: string;
  sessionToken?: string;
}

export const createStripeCheckoutSession = async ({ priceId, email, sessionToken }: StripeCheckoutParams) => {
  console.log('Creating checkout session for:', { priceId, email, hasSessionToken: !!sessionToken });
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error('Authentication error. Please log in again before proceeding.');
  }
  
  if (!session) {
    console.error('No active session found when creating checkout');
    window.location.href = '/login?redirect=pricing';
    throw new Error('Authentication required. Please log in before proceeding.');
  }
  
  // Prepare auth header with session access token
  const authHeader = { Authorization: `Bearer ${session.access_token}` };
  
  console.log('Invoking create-checkout-session with auth header present:', !!authHeader.Authorization);
  
  try {
    const response = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({
        priceId: priceId,
        mode: 'subscription',
        email: email.trim().toLowerCase(),
        sessionToken: sessionToken || ''
      }),
      headers: authHeader
    });

    console.log('Checkout session response:', response);

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
  } catch (error: any) {
    console.error('Error in createStripeCheckoutSession:', error);
    
    // Check if it's a network error
    if (error.message?.includes('NetworkError') || error.message?.includes('network')) {
      throw new Error('Network error when connecting to payment processor. Please check your connection and try again.');
    }
    
    // More specific error for authorization issues
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      window.location.href = '/login?redirect=pricing';
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw error;
  }
};
