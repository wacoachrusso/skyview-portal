import { OpenAI } from 'openai';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function runAssistant({ content, subscriptionPlan }: { content: string, subscriptionPlan: string }) {
  console.log('Running assistant with content:', content);
  
  const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID');
  if (!assistantId) {
    throw new Error('OPENAI_ASSISTANT_ID is not set');
  }

  const response = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      model: 'gpt-4o-mini',
      instructions: `You are a union contract expert. Only answer questions directly related to union contract terms, policies, or provisions. If a question is not related to the contract, politely redirect the user to focus on contract-related topics. Include specific references from the contract in this format: [REF]Section X.X, Page Y: Exact quote[/REF]. If no specific reference exists for this query, please state this clearly in the reference section. Keep responses focused and brief while maintaining accuracy.`
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error from OpenAI:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }

  const data = await response.json();
  return data;
}