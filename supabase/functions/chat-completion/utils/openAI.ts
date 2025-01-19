const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');

export async function createThread() {
  console.log('Creating thread...');
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Thread creation failed:', errorData);
    throw new Error(`Failed to create thread: ${errorData}`);
  }

  return await response.json();
}

export async function addMessageToThread(threadId: string, content: string) {
  console.log('Adding message to thread...');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      role: 'user',
      content: `${content}\n\nYou MUST ALWAYS include a specific section and page number from the contract that supports your answer, formatted exactly like this: [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If there is no specific reference available for this query, you must explicitly state that and explain why in the reference section. Remember that you can only answer questions about the contract - for any other topics, inform the user that you can only discuss contract-related matters.`
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Message creation failed:', errorData);
    throw new Error('Failed to add message to thread');
  }

  return await response.json();
}

export async function runAssistant(threadId: string) {
  console.log('Running assistant...');
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      instructions: "You MUST ALWAYS provide answers based on the contract content and MUST include a reference section with the specific section and page number that supports your answer. Format ALL references as [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If no specific reference exists for a query, you MUST clearly explain why in the reference section and suggest the user to rephrase their question to focus on contract-related matters. Never provide answers without proper contract references. If a user asks about non-contract matters, politely redirect them to focus on contract-related questions only."
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Run creation failed:', errorData);
    throw new Error('Failed to run assistant');
  }

  return await response.json();
}

export async function getRunStatus(threadId: string, runId: string) {
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
    const errorData = await response.text();
    console.error('Status check failed:', errorData);
    throw new Error('Failed to check run status');
  }
  
  return await response.json();
}

export async function getMessages(threadId: string) {
  console.log('Retrieving messages...');
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
    const errorData = await response.text();
    console.error('Messages retrieval failed:', errorData);
    throw new Error('Failed to retrieve messages');
  }

  return await response.json();
}