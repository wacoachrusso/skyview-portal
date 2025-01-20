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

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');

if (!openAIApiKey || !assistantId) {
  throw new Error('Required environment variables are not set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, subscriptionPlan, userId } = await req.json();
    console.log('Received request with content:', content);

    if (!content) {
      throw new Error('Content is required');
    }

    // Check for cached response first
    const cachedResponse = await getCachedResponse(content);
    if (cachedResponse) {
      console.log('Using cached response');
      return new Response(
        JSON.stringify({ response: cachedResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription status
    if (subscriptionPlan === 'free') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('query_count')
        .eq('id', userId)
        .single();

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

    // Check for non-contract content
    if (containsNonContractContent(content)) {
      console.log('Non-contract related query detected');
      const response = "I noticed your question might not be related to your union contract. I'm here specifically to help you understand your contract terms, policies, and provisions. Would you like to rephrase your question to focus on contract-related matters? I'm happy to help you navigate any aspect of your contract.";
      
      await cacheResponse(content, response);
      
      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add a lock to prevent duplicate processing
    const lockKey = `processing_${userId}_${Date.now()}`;
    const { data: lockExists, error: lockError } = await supabase
      .from('cached_responses')
      .select('id')
      .eq('query', lockKey)
      .single();

    if (lockExists) {
      console.log('Request already being processed');
      return new Response(
        JSON.stringify({ error: 'Request already being processed' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set processing lock
    await supabase
      .from('cached_responses')
      .insert([{ 
        query: lockKey,
        response: 'processing',
        created_at: new Date().toISOString()
      }]);

    try {
      // Process the request with OpenAI using retry mechanism
      const processOpenAIRequest = async () => {
        console.log('Creating new thread...');
        const thread = await createThread();
        
        console.log('Adding message to thread...');
        await addMessageToThread(thread.id, content);
        
        console.log('Running assistant...');
        const run = await runAssistant(thread.id);

        // Poll for completion with retries
        let runStatus;
        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await withRetry(() => getRunStatus(thread.id, run.id), {
            maxRetries: 3,
            shouldRetry: (error) => !isRateLimitError(error)
          });
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

        return cleanResponse(assistantMessage.content[0].text.value);
      };

      const cleanedResponse = await withRetry(processOpenAIRequest, {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: (error) => !isRateLimitError(error)
      });

      console.log('Assistant response:', cleanedResponse);

      // Cache the response for future use
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

      // Remove processing lock
      await supabase
        .from('cached_responses')
        .delete()
        .eq('query', lockKey);

      return new Response(
        JSON.stringify({ response: cleanedResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      // Remove processing lock on error
      await supabase
        .from('cached_responses')
        .delete()
        .eq('query', lockKey);
      throw error;
    }

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