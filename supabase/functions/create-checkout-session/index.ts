
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

// Initialize Stripe with proper error handling
const stripe = (() => {
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (!key) {
      console.error('[create-checkout-session] STRIPE_SECRET_KEY is not set');
      return null;
    }
    console.log('[create-checkout-session] Initializing Stripe with key prefix:', key.substring(0, 7) + '...');
    return new Stripe(key, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retry capability to Stripe
    });
  } catch (error) {
    console.error('[create-checkout-session] Failed to initialize Stripe:', error);
    return null;
  }
})();

const isTestMode = () => {
  const key = Deno.env.get('STRIPE_SECRET_KEY') || '';
  return key.startsWith('sk_test_');
};

// Verify Stripe is properly initialized before serving
if (!stripe) {
  console.error('[create-checkout-session] CRITICAL ERROR: Stripe failed to initialize');
}

// Function to validate Stripe key format
const isValidStripeKey = (key: string | undefined): boolean => {
  if (!key) return false;
  // Test mode key format
  const testKeyRegex = /^sk_test_[a-zA-Z0-9]{24,}$/;
  // Live mode key format
  const liveKeyRegex = /^sk_live_[a-zA-Z0-9]{24,}$/;
  return testKeyRegex.test(key) || liveKeyRegex.test(key);
};

serve(async (req) => {
  console.log('[create-checkout-session] Request received:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if Stripe was initialized properly
    if (!stripe) {
      console.error('[create-checkout-session] Stripe was not initialized correctly');
      return new Response(
        JSON.stringify({ 
          error: 'Payment service configuration error', 
          details: 'The payment service is not properly configured',
          code: 'stripe_not_initialized'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Verify Stripe Key format
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!isValidStripeKey(stripeKey)) {
      console.error('[create-checkout-session] Invalid Stripe key format:', 
                    stripeKey ? stripeKey.substring(0, 7) + '...' : 'undefined');
      return new Response(
        JSON.stringify({ 
          error: 'Payment service configuration error', 
          details: 'The Stripe API key is not in the correct format',
          code: 'invalid_stripe_key_format'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract authorization header
    const authHeader = req.headers.get('Authorization') || '';
    console.log('[create-checkout-session] Auth header prefix:', authHeader.substring(0, 15) + '...');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[create-checkout-session] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication error',
          details: 'Missing or invalid authorization header',
          code: 'auth_header_invalid'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    let jsonBody;
    try {
      const requestData = await req.text();
      console.log('[create-checkout-session] Raw request data length:', requestData.length);
      
      jsonBody = JSON.parse(requestData);
      console.log('[create-checkout-session] Request data:', {
        priceId: jsonBody.priceId,
        mode: jsonBody.mode,
        hasEmail: !!jsonBody.email,
        hasToken: !!jsonBody.sessionToken,
        origin: jsonBody.origin
      });
    } catch (error) {
      console.error('[create-checkout-session] JSON parse error:', error.message);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          details: error.message,
          code: 'invalid_json'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { priceId, mode, email, sessionToken, origin } = jsonBody;
    
    // Validate required fields
    if (!priceId || !email) {
      console.error('[create-checkout-session] Missing fields:', { 
        hasPriceId: !!priceId, 
        hasEmail: !!email 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'Price ID and email are required',
          code: 'missing_fields'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the Stripe price ID format
    if (!/^price_[A-Za-z0-9]+$/.test(priceId)) {
      console.error('[create-checkout-session] Invalid price ID format:', priceId);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid price ID format',
          details: 'The provided price ID is not in the correct format',
          code: 'invalid_price_id'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify Stripe connectivity before attempting to create a session
    try {
      // Make a simple API call to verify connectivity
      await stripe.balance.retrieve();
      console.log('[create-checkout-session] Successfully connected to Stripe API');
    } catch (connectError) {
      console.error('[create-checkout-session] Failed to connect to Stripe API:', connectError);
      return new Response(
        JSON.stringify({ 
          error: 'Payment service connectivity error', 
          details: 'Unable to connect to the payment service. Please try again later.',
          code: 'stripe_connectivity_error'
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[create-checkout-session] Stripe key prefix:', stripeKey?.substring(0, 7) + '...');

    // Determine base URL for success and cancel URLs
    const baseUrl = origin || 'https://skyguide.site';
    console.log('[create-checkout-session] Using base URL:', baseUrl);

    // Create the checkout session with error handling
    try {
      const successUrl = `${baseUrl}/auth/callback?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/?scrollTo=pricing-section`;
      
      console.log('[create-checkout-session] Creating session with URLs:', { 
        successUrl,
        cancelUrl
      });
      
      // Try to fetch the price first to verify it exists
      let price;
      try {
        console.log('[create-checkout-session] Verifying price:', priceId);
        price = await stripe.prices.retrieve(priceId);
        
        console.log('[create-checkout-session] Successfully retrieved price:', { 
          id: price.id,
          active: price.active,
          product: price.product
        });
        
        if (!price.active) {
          console.error('[create-checkout-session] Price is inactive:', price.id);
          return new Response(
            JSON.stringify({ 
              error: 'Invalid price', 
              details: 'The selected price is no longer active',
              code: 'inactive_price'
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (priceError) {
        console.error('[create-checkout-session] Failed to retrieve price:', priceError);
        if (priceError.type === 'StripeAuthenticationError') {
          return new Response(
            JSON.stringify({ 
              error: 'Payment service authentication error', 
              details: 'The payment service credentials are invalid',
              code: 'stripe_auth_error'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        return new Response(
          JSON.stringify({ 
            error: 'Price not found', 
            details: 'The selected price could not be found',
            code: 'price_not_found'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('[create-checkout-session] Creating checkout session with price:', priceId);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode || 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: email,
        client_reference_id: sessionToken || undefined,
        metadata: {
          email: email,
          environment: isTestMode() ? 'test' : 'production'
        },
      });

      console.log('[create-checkout-session] Session created successfully:', { 
        id: session.id, 
        hasUrl: !!session.url
      });

      if (!session.url) {
        console.error('[create-checkout-session] Missing session URL in response');
        return new Response(
          JSON.stringify({ 
            error: 'Payment service error', 
            details: 'No checkout URL was generated',
            code: 'no_checkout_url'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (stripeError) {
      console.error('[create-checkout-session] Stripe API error:', stripeError);
      if (stripeError.type) {
        console.error('[create-checkout-session] Stripe error type:', stripeError.type);
      }
      
      // Check if it's a configuration issue
      if (stripeError.message?.includes('API key') || 
          stripeError.message?.includes('authentication') ||
          stripeError.type === 'StripeAuthenticationError') {
        return new Response(
          JSON.stringify({ 
            error: 'Payment service configuration error', 
            details: 'The payment service has an authentication issue',
            code: 'stripe_auth_error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Payment processor error', 
          details: stripeError.message || 'Unknown stripe error',
          code: stripeError.code || 'unknown',
          type: stripeError.type || 'unknown'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('[create-checkout-session] Unhandled error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        message: error.message || 'An unexpected error occurred',
        code: 'server_error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
