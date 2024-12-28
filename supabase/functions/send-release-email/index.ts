import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  releaseNoteId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Processing release note email request')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    const { releaseNoteId }: EmailRequest = await req.json()
    console.log('Release note ID:', releaseNoteId)

    // Get release note details
    const { data: releaseNote, error: releaseError } = await supabase
      .from('release_notes')
      .select('*')
      .eq('id', releaseNoteId)
      .single()

    if (releaseError) throw releaseError
    if (!releaseNote) throw new Error('Release note not found')

    // In development/testing, only send to the verified email
    const isDevelopment = true; // Set this to false when you have a verified domain
    const emailRecipients = isDevelopment 
      ? ['wacoachrusso@gmail.com']
      : await getSubscribedUsers(supabase);

    console.log('Sending email to recipients:', emailRecipients)

    // Prepare email content
    const emailHtml = `
      <h2>New Release: ${releaseNote.title}</h2>
      <p><strong>Version:</strong> ${releaseNote.version}</p>
      ${releaseNote.is_major ? '<p><strong>🌟 Major Update!</strong></p>' : ''}
      <div style="margin: 20px 0;">
        ${releaseNote.description}
      </div>
    `

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // You'll need to change this to your verified domain
        to: emailRecipients,
        subject: `New Release: ${releaseNote.title}`,
        html: emailHtml,
      }),
    })

    const resendResponse = await res.json()
    console.log('Resend API response:', resendResponse)
    
    if (!res.ok) {
      console.error('Resend API error:', resendResponse)
      throw new Error(`Resend API error: ${JSON.stringify(resendResponse)}`)
    }

    // Update last_email_sent timestamp
    const { error: updateError } = await supabase
      .from('release_notes')
      .update({ last_email_sent: new Date().toISOString() })
      .eq('id', releaseNoteId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isDevelopment ? 'Test email sent successfully' : 'Emails sent successfully',
        recipientCount: emailRecipients.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending release note email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Helper function to get subscribed users
async function getSubscribedUsers(supabase: any) {
  // Get all users with email notifications enabled
  const { data: subscribedUsers, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email_notifications')
    .eq('email_notifications', true)

  if (profilesError) throw profilesError
  console.log('Found subscribed users:', subscribedUsers)

  const subscribedUserIds = subscribedUsers.map((user: any) => user.id)

  // Get user emails from auth.users
  const { data: { users }, error: usersError } = await supabase
    .auth.admin.listUsers()

  if (usersError) throw usersError

  return users
    .filter((user: any) => subscribedUserIds.includes(user.id))
    .map((user: any) => user.email)
    .filter((email: string | null): email is string => email !== null)
}

serve(handler)