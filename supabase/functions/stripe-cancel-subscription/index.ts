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
  start_date: string;
  end_date: string;
  payment_status: string;
  updated_at: string;
  user_id: string;
  plan: string;
};

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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
        
         // Get authenticated user from JWT
        const { user_id } = jsonBody;
        
        if (!user_id) {
            return new Response(
                JSON.stringify({ error: "Not authenticated" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch user's profile with subscription details
        const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
            subscription_id,
            subscriptions:subscription_id (stripe_subscription_id)
        `)
        .eq("id", user_id)
        .single();

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: "Profile not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if subscription exists
        const stripeSubscriptionId = profile.subscriptions?.stripe_subscription_id;
        if (!stripeSubscriptionId) {
            return new Response(
                JSON.stringify({ error: "No active subscription" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Cancel Stripe subscription
        try {
            await stripe.subscriptions.del(stripeSubscriptionId);
        } catch (error) {
            console.log(`[stripe-cancel-subscription]: unable to delete subscription`)
            console.log(error)
        }

        // Update database status (optional)
        console.log(`[stripe-cancel-subscription]: cancelling subscription ${profile.subscription_id}`)
        const { error: subUpdateError } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", profile.subscription_id);

        // Update database status (optional)
        console.log(`[stripe-cancel-subscription]: cancelling subscription for profile ${user_id}`)
        const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ subscription_status: "cancelled" })
        .eq("id", user_id);

        if (subUpdateError) {
            console.error("DB update error:", subUpdateError.message);
        }

        if (profileUpdateError) {
            console.error("DB update error:", profileUpdateError.message);
        }
      
        return new Response(
            JSON.stringify({
                message: "Subscription canceled",
                subscription: profile.subscription_id,
                status: 'cancelled',
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );


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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
        );
    }
});
