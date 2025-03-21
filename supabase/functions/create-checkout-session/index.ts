
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const isTestMode = () => {
  const key = Deno.env.get('STRIPE_SECRET_KEY') || '';
  return key.startsWith('sk_test_');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request received:', req.method);
    console.log('Request headers:', JSON.stringify([...req.headers.entries()]));
    
    // Extract and verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Missing authorization header',
          details: 'Authorization header is required'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the request body
    const requestData = await req.text();
    console.log('Request body received, length:', requestData.length);
    
    let jsonBody;
    try {
      jsonBody = JSON.parse(requestData);
      console.log('Parsed request data:', {
        priceId: jsonBody.priceId,
        mode: jsonBody.mode,
        hasEmail: !!jsonBody.email,
        origin: jsonBody.origin
      });
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          details: error.message 
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
      console.error('Missing required fields:', { hasPriceId: !!priceId, hasEmail: !!email });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'Price ID and email are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if Stripe key is valid
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Payment service configuration error', 
          details: 'The payment service is not properly configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine base URL for success and cancel URLs
    const baseUrl = origin || 'https://skyguide.site';
    console.log('Using base URL for redirects:', baseUrl);

    // Create the checkout session
    try {
      const successUrl = `${baseUrl}/auth/callback?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/?scrollTo=pricing-section`;
      
      console.log('Creating checkout session with URLs:', { 
        successUrl,
        cancelUrl
      });
      
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

      console.log('Checkout session created:', { 
        id: session.id, 
        hasUrl: !!session.url
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Payment processor error', 
          details: stripeError.message,
          code: stripeError.code || 'unknown'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Unhandled error in create-checkout-session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        message: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
