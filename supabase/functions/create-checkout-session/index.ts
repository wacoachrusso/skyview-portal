
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
    // Get the request body
    const { priceId, mode, email, sessionToken } = await req.json();
    
    console.log('Create checkout session request:', { 
      priceId, 
      mode, 
      email,
      isTestMode: isTestMode(),
      keyPrefix: Deno.env.get('STRIPE_SECRET_KEY')?.substring(0, 8) || 'not-found'
    });

    if (!priceId || !email) {
      return new Response(
        JSON.stringify({ error: 'Price ID and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode || 'subscription',
      success_url: `${req.headers.get('origin')}/auth/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?scrollTo=pricing-section`,
      customer_email: email,
      client_reference_id: sessionToken || undefined,
      metadata: {
        email: email,
        environment: isTestMode() ? 'test' : 'production'
      },
    });

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
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
