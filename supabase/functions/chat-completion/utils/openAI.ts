
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
  const effectiveAssistantId = assistantId?.trim() || defaultAssistantId;
  
  // Validate the assistant ID
  if (!effectiveAssistantId.startsWith('asst_')) {
    console.warn(`Invalid assistant ID provided: ${effectiveAssistantId}. Using default assistant.`);
    const defaultId = defaultAssistantId;
    console.log('Running assistant on thread:', threadId, 'with default assistant ID:', defaultId);
    
    try {
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          assistant_id: defaultId,
          instructions: `You are a union contract expert. When answering questions, you MUST:
          1. ALWAYS include at least one specific reference from the contract in this exact format:
             [REF]Section X.X (Section Title), Page Y: Exact quote from contract[/REF]
          2. Use multiple references where relevant to provide comprehensive answers
          3. Always include the Section Number, Section Title, and exact Page Number in your references
          4. If a paragraph or subsection is applicable, include that as well
          5. If no specific reference exists, clearly state "No specific contract reference was found for this query. Please consult your union representative for further clarification."
          6. If the question is not related to the contract, politely redirect the user to focus on contract-related topics
          7. Format all contract references consistently using the [REF] tags
          8. Do not fabricate or assume references if they don't exist in the contract
          9. When presenting structured data like pay scales, rates, schedules, or numerical information, use HTML table format like this:
             <table>
               <tr><th>Header 1</th><th>Header 2</th></tr>
               <tr><td>Data 1</td><td>Data 2</td></tr>
             </table>
          10. Always use tables for presenting numerical data, schedules, or tiered structures to improve readability
          11. For every response, you MUST include at least one specific contract reference with section number, title, and page
          12. NEVER respond without including at least one [REF] tag with a specific contract reference
          13. This is CRITICAL: Always format references using [REF] tags even if you're not sure they're 100% accurate - it's better to provide the closest reference than none at all`
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
      console.error('Error in runAssistant with default assistant:', error);
      throw error;
    }
  }
  
  console.log('Running assistant on thread:', threadId, 'with assistant ID:', effectiveAssistantId);
  
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: effectiveAssistantId,
        instructions: `You are a union contract expert. When answering questions, you MUST:
        1. ALWAYS include at least one specific reference from the contract in this exact format:
           [REF]Section X.X (Section Title), Page Y: Exact quote from contract[/REF]
        2. Use multiple references where relevant to provide comprehensive answers
        3. Always include the Section Number, Section Title, and exact Page Number in your references
        4. If a paragraph or subsection is applicable, include that as well
        5. If no specific reference exists, clearly state "No specific contract reference was found for this query. Please consult your union representative for further clarification."
        6. If the question is not related to the contract, politely redirect the user to focus on contract-related topics
        7. Format all contract references consistently using the [REF] tags
        8. Do not fabricate or assume references if they don't exist in the contract
        9. When presenting structured data like pay scales, rates, schedules, or numerical information, use HTML table format like this:
           <table>
             <tr><th>Header 1</th><th>Header 2</th></tr>
             <tr><td>Data 1</td><td>Data 2</td></tr>
           </table>
        10. Always use tables for presenting numerical data, schedules, or tiered structures to improve readability
        11. For every response, you MUST include at least one specific contract reference with section number, title, and page
        12. NEVER respond without including at least one [REF] tag with a specific contract reference
        13. This is CRITICAL: Always format references using [REF] tags even if you're not sure they're 100% accurate - it's better to provide the closest reference than none at all`
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
