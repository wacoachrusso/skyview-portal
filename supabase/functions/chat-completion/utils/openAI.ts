import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function runAssistant({ content, subscriptionPlan }: { content: string, subscriptionPlan: string }) {
  console.log('Running assistant with content:', content);
  
  if (!Deno.env.get('OPENAI_API_KEY')) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });
  
  const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');
  if (!assistantId) {
    throw new Error('OPENAI_ASSISTANT_ID is not set');
  }

  try {
    console.log('Creating thread...');
    const thread = await openai.beta.threads.create();
    console.log('Thread created:', thread.id);
    
    console.log('Adding message to thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `${content}\n\nPlease include specific references from the contract in this format: [REF]Section X.X, Page Y: Exact quote[/REF]. If no specific reference exists for this query, please state that clearly in the reference section.`
    });

    console.log('Creating run with assistant...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: `You are a union contract expert. Only answer questions directly related to union contract terms, policies, or provisions. If a question is not related to the contract, politely redirect the user to focus on contract-related topics. Include specific references from the contract in this format: [REF]Section X.X, Page Y: Exact quote[/REF]. If no specific reference exists for this query, please state this clearly in the reference section. Keep responses focused and brief while maintaining accuracy.`
    });

    console.log('Polling for completion...');
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Run status:', runStatus.status);
    }

    if (runStatus.status !== 'completed') {
      console.error('Run failed with status:', runStatus.status);
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    console.log('Retrieving messages...');
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!assistantMessage || !assistantMessage.content[0]) {
      console.error('No assistant response found in messages:', messages);
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