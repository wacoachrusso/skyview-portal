
import { supabase } from "@/integrations/supabase/client";

interface CreateCheckoutSessionProps {
  priceId: string;
  email: string;
  sessionToken?: string;
  mode?: 'subscription' | 'payment';
  planType?: 'monthly' | 'annual';
}

export const createStripeCheckoutSession = async ({
  priceId,
  email,
  sessionToken,
  mode = 'subscription',
  planType = priceId.includes('QxETH') ? 'monthly' : 'annual'
}: CreateCheckoutSessionProps): Promise<string> => {
  console.log('Creating Stripe checkout session:', { priceId, email, planType });
  
  // Store the selected plan and auth state in localStorage for use after payment
  localStorage.setItem('selected_plan', planType);
  localStorage.setItem('payment_in_progress', 'true');
  
  // *** CRITICAL: Save ALL current auth data to ensure session persistence ***
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Store tokens and user data
    localStorage.setItem('auth_access_token', session.access_token);
    localStorage.setItem('auth_refresh_token', session.refresh_token);
    localStorage.setItem('auth_user_id', session.user.id);
    localStorage.setItem('auth_user_email', session.user.email || '');
    console.log('Saved complete auth data for post-payment recovery');
  }
  
  try {
    if (!session) {
      console.log('No active session, will use email-based flow');
    } else {
      console.log('Active session found for email:', session.user.email);
    }
    
    // Get current origin for redirect URLs
    const origin = window.location.origin;
    
    const response = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({
        priceId,
        mode,
        email,
        sessionToken,
        origin,
        metadata: {
          plan_type: planType,
          is_new_user: !session,
          user_id: session?.user?.id || null,
          access_token: session?.access_token || null,
          payment_source: 'website'
        }
      }),
      headers: session ? {
        Authorization: `Bearer ${session.access_token}`
      } : undefined
    });

    if (response.error) {
      console.error('Error creating checkout session:', response.error);
      throw new Error(response.error.message || 'Failed to create checkout session');
    }
    
    const { data } = response;
    const url = data?.url;
    
    if (!url) {
      console.error('No checkout URL received:', data);
      throw new Error('No checkout URL received from payment processor');
    }
    
    // Set flag to indicate post-payment confirmation on return
    localStorage.setItem('postPaymentConfirmation', 'true');
    
    return url;
  } catch (error) {
    console.error('Error in createStripeCheckoutSession:', error);
    throw error;
  }
};
