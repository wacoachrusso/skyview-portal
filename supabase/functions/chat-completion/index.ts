import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const demoResponses = [
  "This is a demo response to showcase the interface. For accurate contract analysis, please watch our demo video or upgrade to a paid plan.",
  "Here's another example response. To get real answers from your actual contract, consider subscribing to our monthly plan.",
  "This is a demonstration of how the system works. For precise contract interpretation, please upgrade your account."
];

async function createThread(openAIApiKey: string) {
  console.log('Creating thread with OpenAI');
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Thread creation error response:', errorText);
    console.error('Thread creation status:', response.status);
    throw new Error(`Failed to create thread: ${errorText}`);
  }

  return await response.json();
}

async function addMessageToThread(threadId: string, content: string, openAIApiKey: string) {
  console.log('Adding message to thread');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      role: 'user',
      content
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Message creation error:', errorText);
    throw new Error(`Failed to add message to thread: ${errorText}`);
  }
}

async function runAssistant(threadId: string, assistantId: string, openAIApiKey: string) {
  console.log('Running assistant');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Run creation error:', errorText);
    throw new Error(`Failed to run assistant: ${errorText}`);
  }

  return await response.json();
}

async function checkRunStatus(threadId: string, runId: string, openAIApiKey: string) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Status check error:', errorText);
    throw new Error(`Failed to check run status: ${errorText}`);
  }

  return await response.json();
}

async function getAssistantResponse(threadId: string, openAIApiKey: string) {
  console.log('Retrieving messages');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Messages retrieval error:', errorText);
    throw new Error(`Failed to retrieve messages: ${errorText}`);
  }

  const messages = await response.json();
  const assistantMessage = messages.data.find((msg: any) => msg.role === 'assistant');
  
  if (!assistantMessage) {
    throw new Error('No assistant response found');
  }

  return assistantMessage.content[0].text.value;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to chat-completion function');
    const { content, subscriptionPlan } = await req.json();
    
    if (!content) {
      throw new Error('No content provided');
    }

    // For free trial users, return a demo response
    if (subscriptionPlan === 'free') {
      console.log('Free trial user - returning demo response');
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      return new Response(
        JSON.stringify({ 
          response: randomResponse + "\n\nTo access real contract analysis, please upgrade to our monthly plan or watch our demo video to see the full capabilities."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');
    
    if (!openAIApiKey || !assistantId) {
      console.error('OpenAI configuration missing');
      throw new Error('OpenAI configuration missing');
    }

    const thread = await createThread(openAIApiKey);
    await addMessageToThread(thread.id, content, openAIApiKey);
    const run = await runAssistant(thread.id, assistantId, openAIApiKey);

    let runStatus;
    let attempts = 0;
    const maxAttempts = 30;
    
    do {
      if (attempts >= maxAttempts) {
        throw new Error('Timeout waiting for assistant response');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(thread.id, run.id, openAIApiKey);
      console.log('Run status:', runStatus.status);
      attempts++;
    } while (runStatus.status === 'queued' || runStatus.status === 'in_progress');

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    const response = await getAssistantResponse(thread.id, openAIApiKey);
    console.log('Successfully retrieved assistant response');

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});