
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
import { withRetry } from "./utils/retryUtils.ts";

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
    const { content, subscriptionPlan, assistantId, priority, stream, retryCount = 1 } = await req.json();
    
    console.log('Request received for chat completion');
    console.log('Content length:', content?.length || 0);
    console.log('Assistant ID:', assistantId || 'default');
    console.log('Priority request:', priority ? 'Yes' : 'No');
    console.log('Streaming enabled:', stream ? 'Yes' : 'No');
    console.log('Retry count:', retryCount);

    // Check if content appears to be non-contract related
    if (containsNonContractContent(content)) {
      console.log('Content appears to be non-contract related. Providing guidance response.');
      return new Response(JSON.stringify({ 
        response: "I'm designed to answer questions about your union contract. Please ask a question related to your contract's terms, policies, or provisions, and I'll provide specific information with references to the relevant sections."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Max retries for all OpenAI operations
    const maxRetries = Math.min(5, retryCount + 2); // Base + client-requested retries, capped at 5
    
    // Create a thread with retry
    const thread = await withRetry(() => createThread(), {
      maxRetries,
      initialDelay: 300 // Reduced initial delay for faster first attempt
    });
    console.log('Thread created:', thread.id);

    // Add message to thread with retry
    await withRetry(() => addMessageToThread(thread.id, content), {
      maxRetries,
      initialDelay: 300
    });
    console.log('Message added to thread');

    // Run the assistant with the effective assistant ID with retry
    const run = await withRetry(() => runAssistant(thread.id, assistantId), {
      maxRetries,
      initialDelay: 300
    });
    console.log('Assistant run started:', run.id);

    // Ultra-aggressive polling for completion with minimal interval
    // This maximizes the chances of getting a response as soon as it's ready
    let runStatus;
    let attempts = 0;
    const maxAttempts = 300; // 150 seconds maximum wait time when using 500ms polling
    const pollingInterval = priority ? 200 : 300; // Ultra-fast polling for priority requests
    
    do {
      if (attempts >= maxAttempts) {
        throw new Error('Run timed out after 150 seconds');
      }
      
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      
      runStatus = await withRetry(() => getRunStatus(thread.id, run.id), {
        maxRetries: 3,
        initialDelay: 200
      });
      console.log('Run status:', runStatus.status, 'Attempt:', attempts);
      attempts++;
      
    } while (runStatus.status === 'queued' || runStatus.status === 'in_progress');

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // Get messages immediately once complete with retry
    const messages = await withRetry(() => getMessages(thread.id), {
      maxRetries: 3,
      initialDelay: 300
    });
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant message found');
    }

    const rawResponse = assistantMessage.content[0].text.value;
    // Clean and format the response without any unnecessary processing delays
    const response = cleanResponse(rawResponse);
    console.log('Successfully retrieved and processed assistant response');

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-completion function:', error);
    
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
