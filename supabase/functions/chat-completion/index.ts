import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from './utils/supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, subscriptionPlan } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user profile and check assistant assignment
    const { data: profile, error: profileError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (profileError || !profile?.user) {
      throw new Error('Failed to get user profile');
    }

    // Get the user's assigned assistant
    const { data: userProfile, error: userProfileError } = await supabaseClient
      .from('profiles')
      .select('assistant_id')
      .eq('id', profile.user.id)
      .single();

    if (userProfileError || !userProfile?.assistant_id) {
      console.error('Error getting assistant ID:', userProfileError);
      throw new Error('No assistant assigned to your profile. Please contact support.');
    }

    // Send query to OpenAI with the correct assistant
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        model: subscriptionPlan === 'premium' ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions about airline contracts. Always provide references to specific sections when possible.'
          },
          {
            role: 'user',
            content
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    return new Response(JSON.stringify({ response: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat completion:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});