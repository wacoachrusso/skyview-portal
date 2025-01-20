import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCachedResponse, cacheResponse } from './utils/responseCache.ts';
import { createThread, addMessageToThread, runAssistant, getRunStatus, getMessages } from './utils/openAI.ts';
import { cleanResponse, containsNonContractContent } from './utils/validation.ts';
import { withRetry, isRateLimitError } from './utils/retryUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with error handling
const initSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Required Supabase environment variables are not set');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

const validateEnvironment = () => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');

  if (!openAIApiKey || !assistantId) {
    throw new Error('Required OpenAI environment variables are not set');
  }

  return { openAIApiKey, assistantId };
};

serve(async (req) => {
  console.log('Starting chat completion request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize clients and validate environment
    const supabase = initSupabaseClient();
    validateEnvironment();

    const { content, subscriptionPlan, userId } = await req.json();
    console.log('Request payload:', { content, subscriptionPlan, userId });

    if (!content) {
      throw new Error('Content is required');
    }

    // Check for cached response
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

    // Content validation
    if (containsNonContractContent(content)) {
      const response = "I noticed your question might not be related to your union contract. I'm here specifically to help you understand your contract terms, policies, and provisions. Would you like to rephrase your question to focus on contract-related matters?";
      await cacheResponse(content, response);
      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process request with OpenAI
    const thread = await createThread();
    await addMessageToThread(thread.id, content);
    const run = await runAssistant(thread.id);

    // Poll for completion
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await getRunStatus(thread.id, run.id);
      console.log('Run status:', runStatus.status);
    } while (runStatus.status === 'in_progress' || runStatus.status === 'queued');

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    const messages = await getMessages(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    const cleanedResponse = cleanResponse(assistantMessage.content[0].text.value);
    console.log('Assistant response:', cleanedResponse);

    // Cache response
    await cacheResponse(content, cleanedResponse);

    // Update query count for free trial users
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
      JSON.stringify({ 
        error: errorMessage,
        retryAfter: isRateLimitError(error) ? 60 : undefined
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});