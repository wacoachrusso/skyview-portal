import { OpenAI } from 'https://esm.sh/openai@4.28.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function runAssistant({ content, subscriptionPlan }: { content: string, subscriptionPlan: string }) {
  console.log('Running assistant with content:', content);
  
  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });
  
  const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');
  if (!assistantId) {
    throw new Error('OPENAI_ASSISTANT_ID is not set');
  }

  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `${content}\n\nPlease include specific references from the contract in this format: [REF]Section X.X, Page Y: Exact quote[/REF]. If no specific reference exists for this query, please state that clearly in the reference section.`
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: `You are a union contract expert. Only answer questions directly related to union contract terms, policies, or provisions. If a question is not related to the contract, politely redirect the user to focus on contract-related topics. Include specific references from the contract in this format: [REF]Section X.X, Page Y: Exact quote[/REF]. If no specific reference exists for this query, please state this clearly in the reference section. Keep responses focused and brief while maintaining accuracy.`
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Run status:', runStatus.status);
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage || !assistantMessage.content[0]) {
      throw new Error('No assistant response found');
    }

    const response = assistantMessage.content[0].text.value;
    console.log('Assistant response:', response);
    
    return response;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}