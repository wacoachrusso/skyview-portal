import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define the default assistant ID as a constant
const defaultAssistantId = "asst_xpkEzhLUt4Qn6uzRzSxAekGh";
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

if (!openAIApiKey) {
  throw new Error('Required OpenAI API key is not set');
}

const headers = {
  'Authorization': `Bearer ${openAIApiKey}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v2'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function createThread() {
  console.log('Creating new OpenAI thread...');
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Thread creation failed:', errorText);
      throw new Error(`Failed to create thread: ${errorText}`);
    }

    const data = await response.json();
    console.log('Thread created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error in createThread:', error);
    throw error;
  }
}

export async function addMessageToThread(threadId: string, content: string) {
  console.log('Adding message to thread:', threadId);
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Message creation failed:', errorText);
      throw new Error(`Failed to add message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Message added successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error in addMessageToThread:', error);
    throw error;
  }
}

export async function runAssistant(threadId: string, assistantId: string) {
  // Use the default assistant ID if none is provided
  const effectiveAssistantId = assistantId || defaultAssistantId;
  
  console.log('Running assistant on thread:', threadId, 'with assistant ID:', effectiveAssistantId);
  
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: effectiveAssistantId,
        instructions: `You are a union contract expert. When answering questions, you must:
        1. Only answer questions directly related to union contract terms, policies, or provisions
        2. Include specific references from the contract in this exact format:
           [REF]Section X.X, Page Y: Exact quote from contract[/REF]
        3. If no specific reference exists, clearly state this
        4. If the question is not related to the contract, politely redirect the user to focus on contract-related topics
        5. Keep responses focused and accurate
        6. Format all contract references consistently using the [REF] tags`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Run creation failed:', errorText);
      throw new Error(`Failed to run assistant: ${errorText}`);
    }

    const data = await response.json();
    console.log('Assistant run started:', data.id);
    return data;
  } catch (error) {
    console.error('Error in runAssistant:', error);
    throw error;
  }
}

export async function getRunStatus(threadId: string, runId: string) {
  console.log('Getting run status:', runId, 'for thread:', threadId);
  try {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Status check failed:', errorText);
      throw new Error(`Failed to get run status: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getRunStatus:', error);
    throw error;
  }
}

export async function getMessages(threadId: string) {
  console.log('Getting messages from thread:', threadId);
  try {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Messages retrieval failed:', errorText);
      throw new Error(`Failed to get messages: ${errorText}`);
    }

    const data = await response.json();
    console.log('Messages retrieved successfully');
    return data;
  } catch (error) {
    console.error('Error in getMessages:', error);
    throw error;
  }
}

// Server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { content, subscriptionPlan, assistantId } = await req.json();
    
    // Use the default assistant ID if none is provided
    const effectiveAssistantId = assistantId || defaultAssistantId;
    
    // Log detailed information for debugging
    console.log('Processing chat request:', { 
      subscriptionPlan, 
      providedAssistantId: assistantId,
      defaultAssistantId: defaultAssistantId,
      effectiveAssistantId: effectiveAssistantId,
      usingDefault: !assistantId
    });

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers
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
      headers,
      body: JSON.stringify({
        role: 'user',
        content: content
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('Message creation failed:', error);
      throw new Error(`Message creation failed: ${error}`);
    }

    console.log('Message added to thread');

    // Debug log to see exactly what we're sending
    console.log('About to run assistant with:', {
      threadId: thread.id,
      assistantId: effectiveAssistantId,
      requestBody: JSON.stringify({
        assistant_id: effectiveAssistantId,
        instructions: "Please include the specific section and page number from the contract that supports your answer, formatted like this: [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If no specific reference exists for this query, please state that clearly in the reference section."
      })
    });

    // Run the assistant with dynamic assistant ID
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: effectiveAssistantId,
        instructions: "Please include the specific section and page number from the contract that supports your answer, formatted like this: [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If no specific reference exists for this query, please state that clearly in the reference section."
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('Run creation failed:', error);
      throw new Error(`Run creation failed: ${error}`);
    }

    const run = await runResponse.json();
    console.log('Assistant run started:', run.id);

    // Poll for completion
    let runStatus;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    do {
      if (attempts >= maxAttempts) {
        throw new Error('Run timed out after 60 seconds');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        { headers }
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
      { headers }
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