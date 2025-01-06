import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './utils/corsHeaders';
import { cleanResponse } from './utils/cleanResponse';
import { createThread, addMessageToThread, runAssistant, checkRunStatus, getMessages } from './utils/openai';
import { getCachedResponse, cacheResponse } from './utils/caching';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, subscriptionPlan, userId } = await req.json();
    console.log('Received request with content:', content);

    // Check cache first
    const cachedResponse = await getCachedResponse(content);
    if (cachedResponse) {
      console.log('Returning cached response');
      return new Response(
        JSON.stringify({ response: cachedResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription plan
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

    // Check for non-contract queries
    const nonContractKeywords = [
      'weather', 'stocks', 'recipe', 'movie', 'game', 'sports',
      'cryptocurrency', 'dating', 'shopping', 'entertainment'
    ];

    const containsNonContractContent = nonContractKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (containsNonContractContent) {
      const response = "I noticed your question might not be related to your union contract. I'm here specifically to help you understand your contract terms, policies, and provisions. Would you like to rephrase your question to focus on contract-related matters? I'm happy to help you navigate any aspect of your contract.";
      
      // Cache this response too
      await cacheResponse(content, response);
      
      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create thread and get response
    const thread = await createThread();
    await addMessageToThread(thread.id, content);
    const run = await runAssistant(thread.id);

    // Poll for completion
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(thread.id, run.id);
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

    // Cache the response
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});