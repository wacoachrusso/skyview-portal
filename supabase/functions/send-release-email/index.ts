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
      .select('email')
      .eq('email_notifications', true);

    if (profilesError) throw profilesError;
    console.log('Found subscribed users:', subscribedUsers.length);

    const emailRecipients = subscribedUsers
      .map(user => user.email)
      .filter((email): email is string => email !== null);

    if (emailRecipients.length === 0) {
      console.log('No recipients found with email notifications enabled');
      return new Response(
        JSON.stringify({ message: 'No recipients found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create an exciting email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Release Update from SkyGuide</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://skyguide.site/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png" alt="SkyGuide Logo" style="width: 150px; height: auto;">
          </div>
          
          <div style="background-color: #f8fafc; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin-bottom: 20px; text-align: center;">🚀 New Release Alert!</h1>
            
            <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin-bottom: 10px;">${releaseNote.title}</h2>
              <p style="color: #64748b; margin-bottom: 15px;">Version ${releaseNote.version}</p>
              ${releaseNote.is_major ? '<div style="background-color: #dbeafe; color: #1e40af; padding: 10px; border-radius: 6px; margin-bottom: 20px; display: inline-block;">🌟 Major Update!</div>' : ''}
            </div>

            <div style="background-color: white; border-radius: 8px; padding: 20px;">
              <h3 style="color: #0f172a; margin-bottom: 15px;">What's New:</h3>
              <div style="white-space: pre-wrap; color: #475569;">
                ${releaseNote.description}
              </div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://skyguide.site/release-notes" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin-bottom: 20px;">View Full Release Notes</a>
          </div>

          <div style="text-align: center; color: #64748b; font-size: 14px;">
            <p>Stay up to date with all our latest features and improvements!</p>
            <p>The SkyGuide Team</p>
          </div>
        </body>
      </html>
    `;

    // Use Resend's Broadcast API for bulk sending
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide Updates <updates@skyguide.site>",
        bcc: emailRecipients, // Use BCC for privacy
        subject: `New Release: ${releaseNote.title}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend API error:', error);
      throw new Error(`Failed to send emails: ${error}`);
    }

    // Update last_email_sent timestamp
    const { error: updateError } = await supabase
      .from('release_notes')
      .update({ last_email_sent: new Date().toISOString() })
      .eq('id', releaseNoteId);

    if (updateError) throw updateError;

    console.log('Successfully sent release note emails to', emailRecipients.length, 'recipients');

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