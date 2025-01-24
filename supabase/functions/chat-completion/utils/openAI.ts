const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');

export async function createThread() {
  console.log('Creating thread...');
  try {
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

export async function runAssistant(threadId: string) {
  console.log('Running assistant on thread:', threadId);
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions: `You are a union contract expert. When answering questions, you must:
        1. Keep responses concise and focused
        2. Include only the most relevant contract references
        3. Format references as: [REF]Section X.X, Page Y: Key quote[/REF]
        4. If no specific reference exists, briefly state this
        5. Stay focused on contract-related topics`
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
  console.log('Getting run status:', runId);
  try {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Status check failed:', errorText);
      throw new Error(`Failed to get run status: ${errorText}`);
    }

    const data = await response.json();
    console.log('Run status:', data.status);
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
      {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
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