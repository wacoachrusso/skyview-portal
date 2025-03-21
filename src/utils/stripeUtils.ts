
import { supabase } from "@/integrations/supabase/client";

interface StripeCheckoutParams {
  priceId: string;
  email: string;
  sessionToken?: string;
}

export const createStripeCheckoutSession = async ({ priceId, email, sessionToken }: StripeCheckoutParams) => {
  console.log('Creating checkout session for:', { priceId, email, hasSessionToken: !!sessionToken });
  
  try {
    // Get the current session
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
    
    // Force a session refresh to ensure we have the freshest token possible
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('Error refreshing session:', refreshError);
      throw new Error('Could not refresh your session. Please log in again.');
    }

    // Get the refreshed session
    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
    if (!refreshedSession || !refreshedSession.access_token) {
      console.error('No valid session after refresh');
      window.location.href = '/login?redirect=pricing';
      throw new Error('Authentication session invalid. Please log in again.');
    }
    
    // Set API call flag to prevent session validation interference
    sessionStorage.setItem('api_call_in_progress', 'true');
    
    try {
      // Ensure we have a valid auth token
      if (!refreshedSession.access_token) {
        console.error('No access token found in session');
        window.location.href = '/login?redirect=pricing';
        throw new Error('Authentication token missing. Please log in again.');
      }
      
      // Prepare auth header with session access token
      const authHeader = `Bearer ${refreshedSession.access_token}`;
      console.log('Using auth token for checkout request, token prefix:', 
        refreshedSession.access_token.substring(0, 5) + '...');
      
      // Get the current origin for handling redirects
      const origin = window.location.origin;
      console.log('Using origin for redirects:', origin);
      
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          priceId: priceId,
          mode: 'subscription',
          email: email.trim().toLowerCase(),
          sessionToken: sessionToken || refreshedSession.refresh_token || '',
          origin: origin
        }),
        headers: {
          Authorization: authHeader
        }
      });

      console.log('Checkout session response:', response);

      // Clear API call flag
      sessionStorage.removeItem('api_call_in_progress');

      if (response.error) {
        console.error('Error creating checkout session:', response.error);
        
        // If authorization error, redirect to login
        if (response.error.message?.includes('auth') || 
            response.error.message?.includes('Authorization') || 
            response.error.message?.includes('token')) {
          window.location.href = '/login?redirect=pricing';
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      const { data } = response;
      
      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received from payment processor');
      }

      console.log('Successfully created checkout session, redirecting to:', data.url);
      return data.url;
    } catch (error) {
      // Clear API call flag on error
      sessionStorage.removeItem('api_call_in_progress');
      
      console.error('Error in createStripeCheckoutSession:', error);
      
      // Check if it's a network error
      if (error.message?.includes('NetworkError') || error.message?.includes('network')) {
        throw new Error('Network error when connecting to payment processor. Please check your connection and try again.');
      }
      
      // More specific error for authorization issues
      if (error.status === 401 || 
          error.message?.includes('unauthorized') || 
          error.message?.includes('auth') || 
          error.message?.includes('token')) {
        window.location.href = '/login?redirect=pricing';
        throw new Error('Your session has expired. Please log in again.');
      }
      
      throw error;
    }
  } catch (error) {
    // Clear API call flag on error
    sessionStorage.removeItem('api_call_in_progress');
    
    console.error('Error in createStripeCheckoutSession:', error);
    throw error;
  }
};
