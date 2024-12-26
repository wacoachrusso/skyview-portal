import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const cleanResponse = (text: string) => {
  return text
    .replace(/【.*?】/g, '')
    .replace(/\[\d+:\d+†.*?\]/g, '')
    .trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, subscriptionPlan } = await req.json();
    console.log('Received request with content:', content);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: subscriptionPlan === 'premium' ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specializing in airline contracts and policies. Your primary role is to provide accurate answers by directly referencing and quoting specific sections from the contract or policy documents. Always structure your responses like this:

1. Start with the relevant contract/policy section number and quote it exactly, for example:
   According to Section 3.2: "exact quote from the contract"

2. Then provide your explanation of what this means.

3. If multiple sections are relevant, reference each one separately.

4. If you cannot find a specific contract reference for the question, explicitly state that and suggest where the user might find this information (HR, supervisor, etc.).

Remember to always use quotation marks for exact contract language and clearly indicate section numbers.`
          },
          { role: 'user', content }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('Received response from OpenAI');

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error from OpenAI API');
    }

    const cleanedResponse = cleanResponse(data.choices[0].message.content);
    console.log('Cleaned response:', cleanedResponse);

    return new Response(
      JSON.stringify({ response: cleanedResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat completion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});