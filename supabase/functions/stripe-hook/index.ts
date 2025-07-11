
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { plansInProd, plansInTest } from "../_shared/plans.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize Stripe with proper error handling
const stripe = (() => {
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (!key) {
      console.error('[stripe-hook] STRIPE_SECRET_KEY is not set');
      return null;
    }
    console.log('[stripe-hook] Initializing Stripe with key prefix:', key.substring(0, 7) + '...');
    return new Stripe(key, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retry capability to Stripe
    });
  } catch (error) {
    console.error('[stripe-hook] Failed to initialize Stripe:', error);
    return null;
  }
})();

// Verify Stripe is properly initialized before serving
if (!stripe) {
  console.error('[stripe-hook] CRITICAL ERROR: Stripe failed to initialize');
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

type Profile = {
  id: string;
  subscription_id?: string;
};

type Subscription = {
  id?: string;
  stripe_subscription_id: string;
  start_at: string;
  end_at: string;
  payment_status: string;
  updated_at: string;
  user_id: string;
  plan?: string
};

// Helper to parse dates from Stripe timestamps
const toISO = (timestamp: number) => new Date(timestamp * 1000).toISOString();

// Handle different Stripe event types
const handleEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

// Process successful checkout
const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  if (!session.subscription || !session.customer_email) {
    console.error("Missing subscription or user reference");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  console.log(`[stripe-hook] handleCheckoutCompleted : calling for update with subscription ${subscription.id} and email: ${session.customer_email}`)
  let email = session.customer_email
  email = 'jsec516@gmail.com'
  const { data } = await supabase
      .from("profiles")
      .select()
      .eq("email", email)
      .single();

  await createOrUpdateSubscription(
    subscription,
    data.id
  );
};

// Handle subscription changes (plan changes, renewals, etc)
const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  let profile: Profile | null = null;
  
  // First try: Find by Stripe Customer ID
  if (subscription.customer) {
    const customerId = typeof subscription.customer === "string" 
      ? subscription.customer 
      : subscription.customer.id;
      
    const { data } = await supabase
      .from("profiles")
      .select()
      .eq("stripe_customer_id", customerId)
      .single();
      
    profile = data;
  }

  const priceId = subscription.items.data?.[0]?.price?.id
  const isProd = () => {
      const key = Deno.env.get('STRIPE_ENV');
      return key != 'test'
  }
  const selectedPlan = isProd() ? 
                  plansInProd.find((item) => item.priceId == priceId) :
                  plansInTest.find((item) => item.priceId == priceId)
  console.log(`[stripe-hook] handleSubscriptionUpdated : calling for update with subscription ${subscription.id} and ref: ${JSON.stringify(subscription.customer)} with plan ${selectedPlan?.name}`)
  
  // Fallback: Find by email if customer ID not found
  if (!profile && subscription.customer) {
    const customer = typeof subscription.customer === "string"
      ? await stripe.customers.retrieve(subscription.customer)
      : subscription.customer;
      
    if (customer && customer.email) {
      const { data } = await supabase
        .from("profiles")
        .select()
        .eq("email", customer.email)
        .single();
        
      profile = data;
      
      // Update profile with Stripe customer ID if found
      if (profile) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customer.id, subscription_status: 'active' })
          .eq("id", profile.id);
      }
    }
  }

  if (!profile) {
    console.error(`User not found for subscription: ${subscription.id}`);
    return;
  }

  await createOrUpdateSubscription(subscription, profile.id, selectedPlan?.name);
};

// Handle subscription cancellations
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  // Remove subscription reference from profile
  // await supabase
  //   .from("profiles")
  //   .update({ subscription_id: null, subscription_status: 'active' })
  //   .eq("stripe_subscription_id", subscription.id);
};

// Upsert subscription and update profile
const createOrUpdateSubscription = async (
  subscription: Stripe.Subscription,
  userId: string,
  plan?: string
) => {
  let subData: Omit<Subscription, "id"> = {
    stripe_subscription_id: subscription.id,
    start_at: toISO(subscription.current_period_start),
    end_at: toISO(subscription.current_period_end),
    payment_status: subscription.status,
    updated_at: new Date().toISOString(),
    user_id: userId,
  };
  if(plan) {
    subData.plan = plan
  }

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

  console.log(`[stripe-hook] : updating profiles for user id: ${userId}`)
  // Update profile with new subscription reference
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ 
      subscription_id: dbSubscription.id,
      subscription_plan: dbSubscription.plan,
      stripe_customer_id: typeof subscription.customer === "string" 
        ? subscription.customer 
        : subscription.customer?.id
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Profile update error:", profileError);
  }
};

// Server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { });
  }

  try {
    // Check if Stripe was initialized properly
    if (!stripe) {
      console.error('[stripe-hook] Stripe was not initialized correctly');
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
    

    const signature = req.headers.get("stripe-signature")!;
    const body = await req.text();

    console.log('[stripe-hook] signature is: ', signature)
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    await handleEvent(event);
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in stripe-hook function:', error);
    
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
