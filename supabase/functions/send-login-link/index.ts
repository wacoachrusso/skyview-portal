import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, loginUrl } = await req.json();
    console.log("Sending login link email to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: "Login to SkyGuide™",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Login to SkyGuide</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <h1 style="color: #1a365d; text-align: center;">Login to SkyGuide™</h1>
              
              <p style="margin-bottom: 20px;">Click the button below to securely log in to your SkyGuide™ account. This link will expire in 24 hours.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" 
                   style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Log In to SkyGuide
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">If you didn't request this login link, you can safely ignore this email.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                <p>SkyGuide™ - Your Aviation Assistant</p>
                <p>© 2024 SkyGuide. All rights reserved.</p>
                <p>
                  <a href="https://skyguide.site/privacy-policy" style="color: #666; text-decoration: underline;">Privacy Policy</a> • 
                  <a href="https://skyguide.site/terms" style="color: #666; text-decoration: underline;">Terms of Service</a>
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending login link email:", error);
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Login link email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-login-link function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
