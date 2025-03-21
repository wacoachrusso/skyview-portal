
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
      
      // Verify priceId format before sending
      if (!priceId || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
        console.error('Invalid price ID format:', priceId);
        throw new Error('Invalid price ID format. Please try a different plan or contact support.');
      }
      
      // Make 3 attempts to create the checkout session with a small delay between attempts
      let lastError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Checkout attempt ${attempt}/3 for price ID: ${priceId}`);
          
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

          console.log(`Attempt ${attempt} response:`, response);

          if (response.error) {
            lastError = response.error;
            console.error(`Attempt ${attempt} failed:`, response.error);
            
            // If it's an authentication error, break immediately
            if (response.error.message?.includes('auth') || 
                response.error.message?.includes('Authorization') || 
                response.error.message?.includes('token')) {
              window.location.href = '/login?redirect=pricing';
              throw new Error('Your session has expired. Please log in again.');
            }
            
            // For server errors, wait and retry
            if (attempt < 3) {
              console.log(`Waiting before attempt ${attempt + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
            
            throw new Error(response.error.message || 'Failed to create checkout session');
          }

          const { data } = response;
          
          if (!data?.url) {
            console.error('No checkout URL received:', data);
            throw new Error('No checkout URL received from payment processor');
          }

          console.log('Successfully created checkout session, redirecting to:', data.url);
          // Clear API call flag on success
          sessionStorage.removeItem('api_call_in_progress');
          return data.url;
        } catch (retryError) {
          lastError = retryError;
          console.error(`Error in attempt ${attempt}:`, retryError);
          
          // For fatal errors, don't retry
          if (retryError.message?.includes('Authentication') || 
              retryError.message?.includes('log in') ||
              retryError.message?.includes('Invalid price ID')) {
            throw retryError;
          }
          
          // For potentially transient errors, wait and retry if not the last attempt
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          throw retryError;
        }
      }
      
      // If we reached here, all attempts failed
      throw lastError || new Error('Failed to create checkout session after multiple attempts');
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

      // Special handling for edge function errors
      if (error.message?.includes('Edge Function') || 
          error.message?.includes('non-2xx status')) {
        
        throw new Error('The payment service is currently unavailable. Please try again later or contact support.');
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
