
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
  console.log('[stripeUtils] Creating Stripe checkout session:', { priceId, email, planType });
  
  // Store the selected plan and auth state in localStorage for use after payment
  localStorage.setItem('selected_plan', planType);
  localStorage.setItem('payment_in_progress', 'true');
  
  // *** CRITICAL: Save ALL current auth data to ensure session persistence ***
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Store tokens and user data with clear naming
    localStorage.setItem('auth_access_token', session.access_token);
    localStorage.setItem('auth_refresh_token', session.refresh_token);
    localStorage.setItem('auth_user_id', session.user.id);
    localStorage.setItem('auth_user_email', session.user.email || '');
    
    // Also ensure browser cookies have the tokens
    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
    document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
    
    console.log('[stripeUtils] Saved complete auth data for post-payment recovery');
  }
  
  try {
    // Force a session refresh to ensure we have a fresh token
    if (session) {
      try {
        console.log('[stripeUtils] Refreshing session before checkout');
        await supabase.auth.refreshSession();
        console.log('[stripeUtils] Session refreshed successfully');
      } catch (refreshError) {
        console.error('[stripeUtils] Error refreshing session:', refreshError);
        // Continue anyway with the original session
      }
    } else {
      console.log('[stripeUtils] No active session, will use email-based flow');
    }
    
    // Re-fetch session to get the latest tokens
    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
    console.log('[stripeUtils] Using session for email:', refreshedSession?.user?.email || email);
    
    // Get current origin for redirect URLs
    const origin = window.location.origin;
    
    // Extra metadata to help with debugging/tracking
    const metadata = {
      plan_type: planType,
      is_new_user: !refreshedSession,
      user_id: refreshedSession?.user?.id || null,
      payment_source: 'website',
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent
    };
    
    console.log('[stripeUtils] Creating checkout with metadata:', metadata);
    
    const response = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({
        priceId,
        mode,
        email,
        sessionToken,
        origin,
        metadata
      }),
      headers: refreshedSession ? {
        Authorization: `Bearer ${refreshedSession.access_token}`
      } : undefined
    });

    if (response.error) {
      console.error('[stripeUtils] Error creating checkout session:', response.error);
      throw new Error(response.error.message || 'Failed to create checkout session');
    }
    
    const { data } = response;
    const url = data?.url;
    
    if (!url) {
      console.error('[stripeUtils] No checkout URL received:', data);
      throw new Error('No checkout URL received from payment processor');
    }
    
    // Set flag to indicate post-payment confirmation needed on return
    localStorage.setItem('postPaymentConfirmation', 'true');
    
    console.log('[stripeUtils] Checkout URL created successfully, redirecting to:', url);
    return url;
  } catch (error) {
    console.error('[stripeUtils] Error in createStripeCheckoutSession:', error);
    throw error;
  }
};
