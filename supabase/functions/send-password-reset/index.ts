
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate unsubscribe link
const generateUnsubscribeLink = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email + Deno.env.get("RESEND_WEBHOOK_SECRET"));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${new URL(Deno.env.get('SUPABASE_URL') || '').origin}/functions/v1/handle-unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
};

// Generate email footer
const getEmailFooter = async (email: string): Promise<string> => {
  const unsubscribeLink = await generateUnsubscribeLink(email);
  
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p>SkyGuide™ - Your Aviation Career Partner</p>
      <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
      <p style="margin-top: 20px;">
        <a href="${unsubscribeLink}" style="color: #666; text-decoration: underline;">
          Unsubscribe from these emails
        </a>
      </p>
    </div>
  `;
};

interface RequestBody {
  email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email } = await req.json() as RequestBody;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Processing password reset for email:", email);

    // Generate password reset link with direct redirect to reset password page
    const { data, error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://www.skyguide.site/reset-password'
      }
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw resetError;
    }

    if (!data.properties?.action_link) {
      throw new Error("No reset link generated");
    }

    const emailFooter = await getEmailFooter(email);

    // Send custom email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "SkyGuide <no-reply@skyguide.site>",
      to: email,
      subject: "Reset Your SkyGuide Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a365d;">
                <img src="https://skyguide.site/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" alt="SkyGuide Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #1a365d; margin: 0;">Reset Your Password</h1>
              </div>
              
              <div style="padding: 20px 0;">
                <p>Hello,</p>
                <p>We received a request to reset your password for your SkyGuide account. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.properties.action_link}" 
                     style="display: inline-block; padding: 12px 24px; background-color: #1a365d; color: #ffffff; text-decoration: none; border-radius: 4px;">
                    Reset Password
                  </a>
                </div>
                
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>For security, this link will expire in 24 hours.</p>
                
                <p>Best regards,<br>The SkyGuide Team</p>
              </div>
              
              ${emailFooter}
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({ message: "Password reset email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing password reset:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error sending recovery email" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
