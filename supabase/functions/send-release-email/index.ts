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

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to send a single email with retry logic
async function sendSingleEmail(recipient: string, emailHtml: string, subject: string, retryCount = 0): Promise<void> {
  try {
    console.log(`Attempting to send email to ${recipient} (attempt ${retryCount + 1})`);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SkyGuide <notifications@skyguide.site>',
        to: recipient,
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const resendResponse = await res.json();
      if (res.status === 429 && retryCount < 3) {
        console.log(`Rate limit hit for ${recipient}, retrying after delay...`);
        await delay(1000); // Wait 1 second before retry
        return sendSingleEmail(recipient, emailHtml, subject, retryCount + 1);
      }
      throw new Error(`Resend API error: ${JSON.stringify(resendResponse)}`);
    }

    console.log(`Email sent successfully to ${recipient}`);
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Processing release note email request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    const { releaseNoteId }: EmailRequest = await req.json();
    console.log('Release note ID:', releaseNoteId);

    // Get release note details
    const { data: releaseNote, error: releaseError } = await supabase
      .from('release_notes')
      .select('*')
      .eq('id', releaseNoteId)
      .single();

    if (releaseError) throw releaseError;
    if (!releaseNote) throw new Error('Release note not found');

    // Get all users with email notifications enabled
    const { data: subscribedUsers, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email_notifications')
      .eq('email_notifications', true);

    if (profilesError) throw profilesError;
    console.log('Found subscribed users:', subscribedUsers);

    const subscribedUserIds = subscribedUsers.map(user => user.id);

    // Get user emails from auth.users
    const { data: { users }, error: usersError } = await supabase
      .auth.admin.listUsers();

    if (usersError) throw usersError;

    const emailRecipients = users
      .filter(user => subscribedUserIds.includes(user.id))
      .map(user => user.email)
      .filter((email): email is string => email !== null);

    if (emailRecipients.length === 0) {
      console.log('No recipients found with email notifications enabled');
      return new Response(
        JSON.stringify({ message: 'No recipients found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending emails to ${emailRecipients.length} recipients`);

    // Prepare email content
    const emailHtml = `
      <h2>New Release: ${releaseNote.title}</h2>
      <p><strong>Version:</strong> ${releaseNote.version}</p>
      ${releaseNote.is_major ? '<p><strong>🌟 Major Update!</strong></p>' : ''}
      <div style="margin: 20px 0;">
        ${releaseNote.description}
      </div>
    `;

    // Send emails sequentially with delay
    for (const recipient of emailRecipients) {
      try {
        await sendSingleEmail(
          recipient, 
          emailHtml, 
          `New Release: ${releaseNote.title}`
        );
        // Add a 500ms delay between emails to stay within rate limits
        await delay(500);
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        // Continue with next recipient even if one fails
        continue;
      }
    }

    // Update last_email_sent timestamp
    const { error: updateError } = await supabase
      .from('release_notes')
      .update({ last_email_sent: new Date().toISOString() })
      .eq('id', releaseNoteId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully',
        recipientCount: emailRecipients.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending release note email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);