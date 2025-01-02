import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting confirmation email process");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing RESEND_API_KEY");
    }

    const { email, name, confirmationUrl } = await req.json();
    
    if (!email || !confirmationUrl) {
      console.error("Missing required fields:", { email, confirmationUrl });
      throw new Error("Missing required fields");
    }

    console.log("Sending confirmation email to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to SkyGuide - Confirm Your Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
            </div>
            
            <h2 style="color: #333;">Welcome to SkyGuide™!</h2>
            <p>Thank you for signing up. Please click the link below to confirm your email address:</p>
            <p style="margin: 20px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Confirm Email Address
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p>SkyGuide™ - Your Aviation Assistant</p>
              <p>© 2024 SkyGuide. All rights reserved.</p>
              <p>
                <a href="https://skyguide.site/privacy-policy" style="color: #666; text-decoration: underline;">Privacy Policy</a> • 
                <a href="https://skyguide.site/terms" style="color: #666; text-decoration: underline;">Terms of Service</a> •
                <a href="https://skyguide.site/refunds" style="color: #666; text-decoration: underline;">Refund Policy</a>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending confirmation email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email", details: error }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();
    console.log("Confirmation email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
