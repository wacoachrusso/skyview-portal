
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { plansInProd, plansInTest } from "../_shared/plans.ts";

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
      console.error('[stripe-set-session] STRIPE_SECRET_KEY is not set');
      return null;
    }
    console.log('[stripe-set-session] Initializing Stripe with key prefix:', key.substring(0, 7) + '...');
    return new Stripe(key, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retry capability to Stripe
    });
  } catch (error) {
    console.error('[stripe-set-session] Failed to initialize Stripe:', error);
    return null;
  }
})();

// Verify Stripe is properly initialized before serving
if (!stripe) {
  console.error('[stripe-set-session] CRITICAL ERROR: Stripe failed to initialize');
}

type Subscription = {
  id?: string;
  stripe_subscription_id: string;
  start_at: string;
  end_at: string;
  payment_status: string;
  updated_at: string;
  user_id: string;
  plan: string;
};

// Helper to parse dates from Stripe timestamps
const toISO = (timestamp: number) => new Date(timestamp * 1000).toISOString();

const getSessionDetails = async (sessionId) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: [
          'customer',          // Expands to full Customer object
          'subscription',      // Expands to full Subscription object
          'line_items.data.price.product' // Optional: Expand product details
        ]
      });
  
      // Extract relevant data
      const result = {
        sessionId: session.id,
        customerId: session.customer?.id,      // Already expanded
        subscription: session.subscription, // Already expanded
        itemPriceId: session.line_items?.data?.[0]?.price?.id
      };
  
      return result;
    } catch (error) {
      console.error('Error retrieving session:', error);
      throw error;
    }
}

// Upsert subscription and update profile
const createOrUpdateSubscription = async (
  subscription: Stripe.Subscription,
  stripeCustomerId: string,
  plan: string,
  userId: string
) => {
  const subData: Omit<Subscription, "id"> = {
    stripe_subscription_id: subscription.id,
    start_at: toISO(subscription.current_period_start),
    end_at: toISO(subscription.current_period_end),
    payment_status: subscription.status,
    updated_at: new Date().toISOString(),
    plan: plan,
    user_id: userId,
  };

  // Upsert subscription record
  const { data: dbSubscription, error: subError } = await supabase
    .from("subscriptions")
    .upsert(subData, { onConflict: "stripe_subscription_id" })
    .select()
    .single();

  if (subError || !dbSubscription) {
    console.error("Subscription upsert error:", subError);
    return;
  }

  console.log(`[stripe-set-session] : updating profiles for user id: ${userId}`)
  // Update profile with new subscription reference
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ 
      subscription_id: dbSubscription.id,
      stripe_customer_id: stripeCustomerId,
      subscription_plan: dbSubscription.plan,
      subscription_status: 'active'
    })
    .eq("id", userId);

  if (profileError) {
    console.error("[stripe-set-session] : Profile update error:", profileError);
  }
};

const isProd = () => {
    const key = Deno.env.get('STRIPE_ENV');
    return key != 'test'
}

// Server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if Stripe was initialized properly
    if (!stripe) {
      console.error('[stripe-set-session] Stripe was not initialized correctly');
      return new Response(
        JSON.stringify({ 
          error: 'Payment service configuration error', 
          details: 'The payment service is not properly configured',
          code: 'stripe_not_initialized'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    

    // Parse request body
    let jsonBody;
    try {
      const requestData = await req.text();
      console.log('[stripe-set-session] Raw request data length:', requestData.length);
      
      jsonBody = JSON.parse(requestData);
      console.log('[stripe-set-session] Request data:', {
        userId: jsonBody.userId,
        stripeSessionId: jsonBody.stripeSessionId,
      });
    } catch (error) {
      console.error('[stripe-set-session] JSON parse error:', error.message);
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
    
    const { stripeSessionId, userId } = jsonBody;

    const stripeData = await getSessionDetails(stripeSessionId)
    console.log(`[stripe-set-session] : stripData ${JSON.stringify(stripeData)}`)
    const selectedPlan = isProd() ? 
                plansInProd.find((item) => item.priceId == stripeData.itemPriceId) :
                plansInTest.find((item) => item.priceId == stripeData.itemPriceId)
    if(!selectedPlan) {
        console.log(`[stripe-set-session] : no plan found using price id: ${stripeData.itemPriceId} for stripe session ${stripeSessionId}`)
        return new Response(
            JSON.stringify({
              error: `no plan found using price id: ${stripeData.itemPriceId}`,
              details: `no plan found`,
              timestamp: new Date().toISOString(),
              response: `no plan found`,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
    }
    
    await createOrUpdateSubscription(stripeData.subscription, stripeData.customerId, selectedPlan?.name as string, userId)
    
    return new Response(JSON.stringify({ success: true, plan: selectedPlan.name }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in stripe-set-session function:', error);
    
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
