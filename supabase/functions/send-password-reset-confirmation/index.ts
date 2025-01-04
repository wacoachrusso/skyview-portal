import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Sending password reset confirmation email to:", email);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "SkyGuide <no-reply@skyguide.site>",
      to: email,
      subject: "Your SkyGuide Password Has Been Reset",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a365d;">
                <img src="https://skyguide.site/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" alt="SkyGuide Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #1a365d; margin: 0;">Password Reset Confirmation</h1>
              </div>
              
              <div style="padding: 20px 0;">
                <p>Hello,</p>
                <p>Your SkyGuide password has been successfully reset.</p>
                <p>You can now log in to your account using your new password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.skyguide.site/login" 
                     style="display: inline-block; padding: 12px 24px; background-color: #1a365d; color: #ffffff; text-decoration: none; border-radius: 4px;">
                    Log In to SkyGuide
                  </a>
                </div>
                
                <p>If you did not request this password reset, please contact our support team immediately.</p>
                
                <p>Best regards,<br>The SkyGuide Team</p>
              </div>
              
              <div style="text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">
                <p style="margin-bottom: 10px;">SkyGuide™ - Your Aviation Assistant</p>
                <p style="margin-bottom: 10px;">Built by aviation professionals, for aviation professionals.</p>
                <p style="margin-bottom: 10px;">© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending confirmation email:", emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({ message: "Password reset confirmation email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing password reset confirmation:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error sending confirmation email" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});