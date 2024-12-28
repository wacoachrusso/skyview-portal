import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send signup confirmation email");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service configuration is missing");
    }

    const { email, name, confirmationUrl } = await req.json() as EmailRequest;
    console.log("Processing confirmation email for:", email);

    if (!email || !confirmationUrl) {
      console.error("Missing required fields:", { email, confirmationUrl });
      throw new Error("Missing required fields");
    }

    console.log("Sending email via Resend API");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: "Welcome to SkyGuide - Confirm Your Email",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Welcome to SkyGuide!</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <h1 style="color: #1a365d; text-align: center;">Welcome to SkyGuide!</h1>
              
              <p style="margin-bottom: 20px;">Hi ${name || 'there'},</p>
              
              <p style="margin-bottom: 20px;">Thank you for signing up! Please confirm your email address to get started with SkyGuide.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Confirm Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">If you didn't create a SkyGuide account, you can safely ignore this email.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                <p>SkyGuide - Your Aviation Assistant</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await res.json();
    console.log("Resend API response:", data);

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(`Failed to send email: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-signup-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);