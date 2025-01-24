import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runAssistant } from "./utils/openAI.ts";
import { getCachedResponse, cacheResponse } from './utils/responseCache.ts';
import { cleanResponse, containsNonContractContent } from './utils/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Starting chat completion request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content, subscriptionPlan, userId } = await req.json();
    console.log('Request payload:', { content, subscriptionPlan, userId });

    if (!content) {
      throw new Error('Content is required');
    }

    const cachedResponse = await getCachedResponse(content);
    if (cachedResponse) {
      console.log('Using cached response');
      return new Response(
        JSON.stringify({ response: cachedResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subscription check
    if (subscriptionPlan === 'free') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('query_count')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to verify subscription status');
      }

      if (profile && profile.query_count >= 1) {
        console.log('Free trial limit exceeded');
        return new Response(
          JSON.stringify({
            error: 'FREE_TRIAL_ENDED',
            message: 'Your free trial has ended. Please upgrade to continue using SkyGuide.'
          }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (containsNonContractContent(content)) {
      const response = "I noticed your question might not be related to your union contract. I'm here specifically to help you understand your contract terms, policies, and provisions. Would you like to rephrase your question to focus on contract-related matters?";
      await cacheResponse(content, response);
      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await runAssistant({ content, subscriptionPlan });
    const cleanedResponse = cleanResponse(response);
    console.log('Assistant response:', cleanedResponse);

    await cacheResponse(content, cleanedResponse);

    if (subscriptionPlan === 'free') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ query_count: 1 })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating query count:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ response: cleanedResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat completion:', error);
    
    const errorMessage = error.message || 'An unexpected error occurred';
    const statusCode = error.status || 500;
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});