import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, mode, email } = await req.json();
    
    console.log('Received request with:', { priceId, mode, email });

    if (!email) {
      console.error('No email provided in request');
      throw new Error('No email provided');
    }

    if (!priceId) {
      console.error('No price ID provided in request');
      throw new Error('No price ID provided');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Check if customer exists
    console.log('Checking for existing customer...');
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customerId = undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Found existing customer:', customerId);

      // Check if already subscribed
      if (mode === 'subscription') {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          price: priceId,
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          throw new Error('Already subscribed to this plan');
        }
      }
    }

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode || 'subscription',
      success_url: `${req.headers.get('origin')}/auth/callback?payment=success`,
      cancel_url: `${req.headers.get('origin')}/`, // Updated to redirect to home page
    });

    console.log('Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});