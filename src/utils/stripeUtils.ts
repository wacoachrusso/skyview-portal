
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
  
  // Store the selected plan in localStorage for use after payment
  localStorage.setItem('selected_plan', planType);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session, will use email-based flow');
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
          is_new_user: !session
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
