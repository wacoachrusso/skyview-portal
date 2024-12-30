import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service configuration is missing");
    }

    const { email, resetUrl } = await req.json() as EmailRequest;
    console.log("Processing password reset for:", email);

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Generate password reset token
    console.log("Generating reset link...");
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: resetUrl, // The resetUrl will already include /reset-password
      }
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw resetError;
    }

    if (!data.properties?.action_link) {
      console.error("No reset link generated in response");
      throw new Error("No reset link generated");
    }

    console.log("Reset link generated successfully");
    console.log("Sending email via Resend...");

    // Get current time in NYC timezone
    const nycTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Send email via Resend with consistent branding
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: "Reset Your SkyGuide Password",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Reset Your Password</title>
              <style>
                .button {
                  background-color: #fbbf24;
                  color: #1a365d;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  display: inline-block;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  text-align: center;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <!-- Header with Logo -->
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <!-- Main Content -->
              <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #1a365d; text-align: center; margin-bottom: 20px;">Reset Your Password</h1>
                
                <p style="margin-bottom: 20px;">We received a request to reset your SkyGuide™ account password at ${nycTime} EST. Click the button below to choose a new password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.properties.action_link}" class="button">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">If you didn't request this change, you can safely ignore this email.</p>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <p style="margin-bottom: 10px;">SkyGuide™ - Your Aviation Assistant</p>
                <p style="margin-bottom: 10px;">Built by aviation professionals, for aviation professionals.</p>
                <p style="margin-bottom: 10px;">© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
                <div style="margin-top: 20px;">
                  <a href="https://skyguide.site/privacy-policy" style="color: #666; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                  <a href="https://skyguide.site/terms" style="color: #666; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const emailData = await res.json();
    console.log("Resend API response:", emailData);

    if (!res.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(`Email sending failed: ${emailData.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in password reset process:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);