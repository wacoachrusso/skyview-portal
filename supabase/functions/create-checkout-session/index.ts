
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
    console.log('Request headers:', JSON.stringify([...req.headers.entries()]));
    
    // Verify JWT token from Supabase Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Missing or invalid authorization',
          details: 'Please sign in to continue'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the request body
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    let jsonBody;
    try {
      jsonBody = JSON.parse(requestBody);
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { priceId, mode, email, sessionToken } = jsonBody;
    
    console.log('Create checkout session request:', { 
      priceId, 
      mode, 
      email,
      hasSessionToken: !!sessionToken,
      isTestMode: isTestMode(),
      keyPrefix: Deno.env.get('STRIPE_SECRET_KEY')?.substring(0, 8) || 'not-found'
    });

    if (!priceId || !email) {
      console.error('Missing required fields:', { hasPriceId: !!priceId, hasEmail: !!email });
      return new Response(
        JSON.stringify({ error: 'Price ID and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Stripe key is valid
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Payment service not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the checkout session
    let session;
    try {
      // Fetch origin dynamically from the request if needed
      const origin = req.headers.get('origin') || 'https://skyguide.site';
      const cancelUrl = `${origin}/?scrollTo=pricing-section`;
      const successUrl = `${origin}/auth/callback?session_id={CHECKOUT_SESSION_ID}`;
      
      console.log('Creating checkout session with URLs:', { 
        successUrl,
        cancelUrl,
        origin
      });
      
      session = await stripe.checkout.sessions.create({
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
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Payment processor error', 
          details: stripeError.message,
          code: stripeError.code || 'unknown'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checkout session created:', { 
      id: session.id, 
      url: session.url,
      environment: isTestMode() ? 'test' : 'production'
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
