import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log('Making request to OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    console.log('Received response from OpenAI API');
    const data = await openAIResponse.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Invalid response format from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat completion:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return new Response(
        JSON.stringify({ 
          error: 'Network error while connecting to OpenAI',
          details: error.toString()
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});