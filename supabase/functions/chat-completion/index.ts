import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const assistantId = "asst_YdZtVHPSq6TIYKRkKcOqtwzn";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIHeaders = {
  'Authorization': `Bearer ${openAIApiKey}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v1'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { content, subscriptionPlan } = await req.json();
    console.log('Processing chat request:', { subscriptionPlan });

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: openAIHeaders
    });

    if (!threadResponse.ok) {
      const error = await threadResponse.text();
      console.error('Thread creation failed:', error);
      throw new Error(`Thread creation failed: ${error}`);
    }

    const thread = await threadResponse.json();
    console.log('Thread created:', thread.id);

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: openAIHeaders,
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation failed:', error);
      throw new Error(`Message creation failed: ${error}`);
    }

    console.log('Message added to thread');

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: openAIHeaders,
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation failed:', error);
      throw new Error(`Run creation failed: ${error}`);
    }

    const run = await runResponse.json();
    console.log('Run started:', run.id);

    // Poll for completion
    let runStatus;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    do {
      if (attempts >= maxAttempts) {
        throw new Error('Run timed out after 30 seconds');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        { headers: openAIHeaders }
      );

      if (!statusResponse.ok) {
        const error = await statusResponse.text();
        console.error('Status check failed:', error);
        throw new Error(`Status check failed: ${error}`);
      }

      runStatus = await statusResponse.json();
      console.log('Run status:', runStatus.status);
      attempts++;
    } while (runStatus.status === 'queued' || runStatus.status === 'in_progress');

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      { headers: openAIHeaders }
    );

    if (!messagesResponse.ok) {
      const error = await messagesResponse.text();
      console.error('Messages retrieval failed:', error);
      throw new Error(`Messages retrieval failed: ${error}`);
    }

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant message found');
    }

    const response = assistantMessage.content[0].text.value;
    console.log('Successfully retrieved assistant response');

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-completion function:', error);
    
    // Return a more detailed error response
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