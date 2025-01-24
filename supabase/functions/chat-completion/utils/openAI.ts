import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function runAssistant({ content, subscriptionPlan }: { content: string, subscriptionPlan: string }) {
  console.log('Running assistant with content:', content);
  
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('OPENAI_ASSISTANT_ID is not set');
  }

  const response = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      model: 'gpt-4o-mini',
      instructions: "You are a union contract expert. Only answer questions directly related to union contract terms, policies, or provisions. If a question is not related to the contract, politely redirect the user to focus on contract-related topics. Include specific references from the contract in this format: 'Section X.X, Page Y: Exact quote'. If no specific reference exists, clearly state this. Keep responses focused and brief while maintaining accuracy."
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
