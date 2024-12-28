import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import * as webPush from 'https://esm.sh/web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating VAPID keys...')
    const vapidKeys = webPush.generateVAPIDKeys()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Storing VAPID keys in database...')
    const { data, error } = await supabaseClient
      .from('vapid_keys')
      .insert([
        {
          public_key: vapidKeys.publicKey,
          private_key: vapidKeys.privateKey,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error storing VAPID keys:', error)
      throw error
    }

    console.log('VAPID keys generated and stored successfully')
    return new Response(
      JSON.stringify({ 
        publicKey: vapidKeys.publicKey,
        message: 'VAPID keys generated and stored successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in generate-vapid-keys function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})