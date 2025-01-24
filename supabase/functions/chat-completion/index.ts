// Import xhr first to ensure proper environment setup
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

const TIMEOUT_DURATION = 25000; // 25 seconds timeout
const MAX_POLLING_ATTEMPTS = 50; // Increased max attempts with shorter intervals
const POLLING_INTERVAL = 500; // 500ms between checks

const initSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Required Supabase environment variables are not set');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

serve(async (req) => {
  console.log('Starting chat completion request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = initSupabaseClient();
    const { content, subscriptionPlan, userId } = await req.json();
    console.log('Request payload:', { content, subscriptionPlan, userId });

    if (!content) {
      throw new Error('Content is required');
    }

    // Check cache first for faster responses
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

    const processRequest = async () => {
      try {
        console.log('Creating new thread for chat...');
        const thread = await createThread();
        
        console.log('Adding message to thread...');
        await addMessageToThread(thread.id, content);
        
        console.log('Running assistant...');
        const run = await runAssistant(thread.id);

        let runStatus;
        let attempts = 0;
        
        do {
          if (attempts >= MAX_POLLING_ATTEMPTS) {
            throw new Error('Response timeout exceeded');
          }
          
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          runStatus = await getRunStatus(thread.id, run.id);
          console.log('Run status:', runStatus.status, 'Attempt:', attempts + 1);
          attempts++;
        } while (runStatus.status === 'in_progress' || runStatus.status === 'queued');

        if (runStatus.status !== 'completed') {
          console.error('Run failed with status:', runStatus.status);
          throw new Error(`Run failed with status: ${runStatus.status}`);
        }

        console.log('Getting messages from thread...');
        const messages = await getMessages(thread.id);
        const assistantMessage = messages.data.find(m => m.role === 'assistant');
        
        if (!assistantMessage) {
          throw new Error('No assistant response found');
        }

        return assistantMessage.content[0].text.value;
      } catch (error) {
        console.error('Error in processRequest:', error);
        throw error;
      }
    };

    const response = await Promise.race([
      processRequest(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), TIMEOUT_DURATION))
    ]);

    const cleanedResponse = cleanResponse(response);
    console.log('Assistant response received');

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
    
    const errorMessage = error.message === 'Operation timed out' 
      ? 'The request took too long to process. Please try again.'
      : error.message || 'An unexpected error occurred';
    
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
