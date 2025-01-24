import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { cleanResponse } from "./utils/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, subscriptionPlan } = await req.json();
    
    console.log('Processing chat request:', { subscriptionPlan });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a union contract expert. Your primary role is to:
1. Always search for and provide specific contract references when answering questions
2. Format references exactly like this: [REF]Section X.X, Page Y: Exact quote from contract[/REF]
3. If multiple references are relevant, include them all in separate [REF] tags
4. If you cannot find a specific reference for a question:
   - Clearly state that you cannot find a specific reference
   - Suggest which sections of the contract might be relevant
   - Recommend consulting specific sections of the contract
5. Never provide generic responses without attempting to find relevant contract sections
6. Always maintain a professional and precise tone
7. Focus exclusively on contract-related inquiries`
          },
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    const cleanedResponse = cleanResponse(data.choices[0].message.content);

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