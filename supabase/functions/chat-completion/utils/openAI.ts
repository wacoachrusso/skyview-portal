import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
// Default assistant ID as fallback
const defaultAssistantId = "asst_xpkEzhLUt4Qn6uzRzSxAekGh";

if (!openAIApiKey) {
  throw new Error('Required OpenAI API key is not set');
}

const headers = {
  'Authorization': `Bearer ${openAIApiKey}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v2'
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