
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  getRunStatus, 
  getMessages 
} from "./utils/openAI.ts";
import { cleanResponse, containsNonContractContent } from "./utils/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { content, subscriptionPlan, assistantId, priority } = await req.json();
    
    console.log('Request received for chat completion');
    console.log('Content length:', content?.length || 0);
    console.log('Assistant ID:', assistantId || 'default');
    console.log('Priority request:', priority ? 'Yes' : 'No');

    // Check if content appears to be non-contract related
    if (containsNonContractContent(content)) {
      console.log('Content appears to be non-contract related. Providing guidance response.');
      return new Response(JSON.stringify({ 
        response: "I'm designed to answer questions about your union contract. Please ask a question related to your contract's terms, policies, or provisions, and I'll provide specific information with references to the relevant sections."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a thread
    const thread = await createThread();
    console.log('Thread created:', thread.id);

    // Add message to thread
    await addMessageToThread(thread.id, content);
    console.log('Message added to thread');

    // Run the assistant with the effective assistant ID
    const run = await runAssistant(thread.id, assistantId);
    console.log('Assistant run started:', run.id);

    // Poll for completion with optimized polling interval
    let runStatus;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout (reduced from 60)
    const pollingInterval = priority ? 500 : 1000; // Faster polling for priority requests
    
    do {
      if (attempts >= maxAttempts) {
        throw new Error('Run timed out after 30 seconds');
      }
      
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      
      runStatus = await getRunStatus(thread.id, run.id);
      console.log('Run status:', runStatus.status);
      attempts++;
    } while (runStatus.status === 'queued' || runStatus.status === 'in_progress');

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // Get messages
    const messages = await getMessages(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant message found');
    }

    const rawResponse = assistantMessage.content[0].text.value;
    // Clean and format the response
    const response = cleanResponse(rawResponse);
    console.log('Successfully retrieved and processed assistant response');

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-completion function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
