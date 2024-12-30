import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  resetUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, resetUrl } = await req.json() as RequestBody;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Processing password reset for email:", email);
    console.log("Reset URL:", resetUrl);

    const { data, error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    if (resetError) {
      throw resetError;
    }

    // Email template with consistent branding
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #1a365d;
            }
            .content {
              padding: 20px 0;
              color: #333;
            }
            .footer {
              text-align: center;
              padding: 20px 0;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #eee;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #1a365d;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://skyguide.site/logo.png" alt="SkyGuide Logo" class="logo">
              <h1 style="color: #1a365d; margin: 0;">Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your SkyGuide account. Click the link in the email from Supabase to reset your password.</p>
              <p>If you didn't request this password reset, you can safely ignore this email.</p>
              <p>Best regards,<br>The SkyGuide Team</p>
            </div>
            <div class="footer">
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
    `;

    // Send the custom email
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: email,
        subject: "Reset Your SkyGuide Password",
        html: emailHtml,
      },
    });

    if (emailError) {
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});