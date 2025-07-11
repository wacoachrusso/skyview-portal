
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


// Initialize Stripe with proper error handling
const stripe = (() => {
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (!key) {
      console.error('[switch-plan] STRIPE_SECRET_KEY is not set');
      return null;
    }
    console.log('[switch-plan] Initializing Stripe with key prefix:', key.substring(0, 7) + '...');
    return new Stripe(key, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retry capability to Stripe
    });
  } catch (error) {
    console.error('[switch-plan] Failed to initialize Stripe:', error);
    return null;
  }
})();

const isTestMode = () => {
  const key = Deno.env.get('STRIPE_SECRET_KEY') || '';
  return key.startsWith('sk_test_');
};

// Verify Stripe is properly initialized before serving
if (!stripe) {
  console.error('[switch-plan] CRITICAL ERROR: Stripe failed to initialize');
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

// Server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let jsonBody;
    try {
      const requestData = await req.text();
      console.log('[switch-plan] Raw request data length:', requestData.length);
      
      jsonBody = JSON.parse(requestData);
      console.log('[switch-plan] Request data:', {
        newPlan: jsonBody.newPlan,
        email: jsonBody.email,
        subscriptionId: jsonBody.subscriptionId,
      });
    } catch (error) {
      console.error('[switch-plan] JSON parse error:', error.message);
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
    
    const { subscriptionId, newPlan, email } = jsonBody;
    
    console.log('Request received for switching plan');
    console.log('newPlan', newPlan);
    console.log('email', email);

    // Check if Stripe was initialized properly
    if (!stripe) {
      console.error('[switch-plan] Stripe was not initialized correctly');
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
      console.error('[switch-plan] Invalid Stripe key format:', 
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
    console.log('[switch-plan] Auth header prefix:', authHeader.substring(0, 15) + '...');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[switch-plan] Missing or invalid authorization header');
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

    // Fetch user's profile with subscription details
    const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
        id,
        subscription_id,
        subscriptions:subscription_id (stripe_subscription_id)
    `)
    .eq("email", email)
    .single();

    const stripeSubscriptionId = profile.subscriptions?.stripe_subscription_id;
    let targetPriceId = 'price_1QxETwA8w17QmjsP9tnCgLAx' // annual
    let proration_behavior = 'always_invoice'
    let billing_cycle_anchor = 'now'
    if(newPlan == 'monthly') {
      targetPriceId = 'price_1QxETHA8w17QmjsPS1R3bhj8'
      proration_behavior = "none" // No immediate proration
      billing_cycle_anchor = "unchanged" // Change at next renew
    }

    console.log(`[switch-plan] triggering stripe subscription update with proration_behavior: ${proration_behavior} and sub id: ${stripeSubscriptionId}`);

    // Retrieve current subscription
    const subscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId,
      { expand: ["schedule"] }
    );

    let scheduleId = null;
    if (subscription.schedule) {
      scheduleId = subscription.schedule.id;
    }

    console.log(`[switch-plan] : updating subscription to item: ${subscription.items.data[0].id}`)
    let updatedSub = null;

    if(newPlan == 'monthly') {
      let schedule;
    
      // Scenario A: Existing schedule found
      if (scheduleId) {
        try {
          console.log(`[switch-plan]: we are using existing schedule: ${scheduleId}`)
          // Update existing schedule
          schedule = await stripe.subscriptionSchedules.update(scheduleId, {
            phases: [
              // Phase 1: Current plan until period end
              {
                start_date: subscription.current_period_start,
                end_date: subscription.current_period_end,
                items: subscription.items.data.map(item => ({
                  price: item.price.id,
                  quantity: item.quantity
                })),
              },
              // Phase 2: New monthly plan
              {
                items: [{
                  price: targetPriceId,
                  quantity: 1
                }],
              }
            ],
          });
        } catch (err) {
          console.error(`Error updating schedule ${scheduleId}:`, err);
          // Handle invalid schedule ID (e.g., schedule was canceled)
          scheduleId = null;
        }
      }

      // Scenario B: No existing schedule
      if (!scheduleId) {
        // Create new schedule
        schedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscription.id,
        });

        // Update the new schedule
        schedule = await stripe.subscriptionSchedules.update(schedule.id, {
          phases: [
            {
              start_date: subscription.current_period_start,
              end_date: subscription.current_period_end,
              items: subscription.items.data.map(item => ({
                price: item.price.id,
                quantity: item.quantity
              })),
            },
            {
              items: [{
                price: targetPriceId,
                quantity: 1
              }],
            }
          ],
        });

        scheduleId = schedule.id;
      }

      // 5. Update the db
      // Update profile with new subscription plan
      console.log(`[switch-plan]: updating subscription_plan to monthly for profile ${profile.id} `)
      console.log(JSON.stringify(profile))
      const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        subscription_plan: 'monthly',
      })
      .eq("id", profile.id);

      if(profileError) {
        console.log(`[switch-plan]: error happened to update subscription plan in profie ${profile.id}`)
        console.log(profileError)
      }


      // Update subscriptions with new subscription plan
      console.log(`[switch-plan]: updating subscription_plan for subscriptions ${profile.subscription_id} `)
      const { error: subError } = await supabase
      .from("subscriptions")
      .update({ 
        plan: 'monthly',
      })
      .eq("id", profile.subscription_id);

      if(subError) {
        console.log(`[switch-plan]: error happened to update subscription plan in subscription ${profile.subscription_id}`)
        console.log(subError)
      }
    } else {
      // Update to annual plan
      const updatedSub = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: targetPriceId
        }],
        billing_cycle_anchor: billing_cycle_anchor,
        proration_behavior: proration_behavior,
        payment_behavior: 'error_if_incomplete',
      });
      // Check if immediate payment is needed
      if (updatedSub.pending_setup_intent) {
        console.log(`[switch-plan] : requires payment`);
        const setupIntent = await stripe.setupIntents.retrieve(
          updatedSub.pending_setup_intent
        );
        return new Response(JSON.stringify({ 
          status: 'requires_payment',
          clientSecret: setupIntent.client_secret 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`[switch-plan] : plan switch completed, returning`);
    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in switch-plan function:', error);
    
    let errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";
    let statusCode = 500;
    
    // More specific error messages based on error type
    if (error.message?.includes('timeout')) {
      errorMessage = "The request took too long to process. Please try a shorter or simpler question.";
    } else if (error.message?.includes('rate limit')) {
      errorMessage = "Our service is experiencing high demand. Please try again in a few moments.";
      statusCode = 429;
    }
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
        response: errorMessage
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
