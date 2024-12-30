import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  resetUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { email, resetUrl } = await req.json() as RequestBody;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Processing password reset for email:", email);
    console.log("Reset URL:", resetUrl);

    // Generate password reset link using the admin API
    const { data, error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${resetUrl}`,
      }
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw resetError;
    }

    if (!data.properties?.action_link) {
      throw new Error("No reset link generated");
    }

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
              
              <div style="text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">
                <p style="margin-bottom: 10px;">SkyGuide™ - Your Aviation Assistant</p>
                <p style="margin-bottom: 10px;">Built by aviation professionals, for aviation professionals.</p>
                <p style="margin-bottom: 10px;">© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
                <div style="margin-top: 20px;">
                  <a href="https://skyguide.site/privacy-policy" style="color: #666; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                  <a href="https://skyguide.site/terms" style="color: #666; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </div>
              </div>
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