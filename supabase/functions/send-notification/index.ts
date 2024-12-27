import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { userId, title, message, type = 'system' } = await req.json()
    console.log('Sending notification:', { userId, title, message, type })

    const { data, error } = await supabaseClient
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          is_read: false,
        }
      ])
      .select()
      .single()

    if (error) throw error

    console.log('Notification created:', data)

    return new Response(
      JSON.stringify({ success: true, notification: data }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 400
      }
    )
  }
})