import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const cleanResponse = (text: string) => {
  return text
    .replace(/【.*?】/g, '')
    .replace(/\[\d+:\d+†.*?\]/g, '')
    .trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, subscriptionPlan } = await req.json();
    console.log('Received request with content:', content);

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!threadResponse.ok) {
      throw new Error('Failed to create thread');
    }

    const thread = await threadResponse.json();
    console.log('Created thread:', thread.id);

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    if (!messageResponse.ok) {
      throw new Error('Failed to add message to thread');
    }

    console.log('Added message to thread');

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      throw new Error('Failed to run assistant');
    }

    const run = await runResponse.json();
    console.log('Started run:', run.id);

    // Poll for completion
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1'
          }
        }
      );
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }
      
      runStatus = await statusResponse.json();
      console.log('Run status:', runStatus.status);
    } while (runStatus.status === 'in_progress' || runStatus.status === 'queued');

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      }
    );

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve messages');
    }

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    const cleanedResponse = cleanResponse(assistantMessage.content[0].text.value);
    console.log('Assistant response:', cleanedResponse);

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