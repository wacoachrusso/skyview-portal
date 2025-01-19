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
      content: `${content}\n\nYou MUST ALWAYS provide a specific section and page number from the contract in your response. Format it EXACTLY as: [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If you cannot find a specific reference for the query, you MUST respond with: "I cannot answer this question without a specific contract reference. Please ask about a specific section of the contract." Do not provide general responses without contract references.`
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
      instructions: "You are a contract expert that MUST ALWAYS provide specific contract references. Every response MUST include [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If you cannot find a specific reference, respond with: 'I cannot answer this question without a specific contract reference. Please ask about a specific section of the contract.' Never provide general responses or explanations without exact contract references. If a user asks about non-contract matters, inform them that you can only discuss specific contract sections."
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