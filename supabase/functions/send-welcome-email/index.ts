import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting welcome email process");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing RESEND_API_KEY");
    }

    const { email, name } = await req.json();
    
    if (!email) {
      console.error("Missing required fields:", { email });
      throw new Error("Missing required fields");
    }

    console.log("Sending welcome email to:", email);

    // Using verified domain
    const fromEmail = "onboarding@skyguide.site";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Welcome to SkyGuide - Your Aviation Assistant",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a365d;">Welcome to SkyGuide!</h1>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear ${name || "Aviation Professional"},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Welcome aboard! We're thrilled to have you join the SkyGuide community. You now have access to our advanced AI-powered aviation assistant, designed specifically for aviation professionals like you.
            </p>
            
            <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h2 style="color: #2d3748; margin-bottom: 15px;">Getting Started</h2>
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                <li style="margin-bottom: 10px;">💬 Start a conversation with our AI assistant</li>
                <li style="margin-bottom: 10px;">📚 Access comprehensive aviation knowledge</li>
                <li style="margin-bottom: 10px;">🔍 Get instant answers to your questions</li>
                <li style="margin-bottom: 10px;">📱 Available on any device, anywhere</li>
              </ul>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We're here to support your aviation career and make your daily operations smoother. If you have any questions, simply reply to this email - we're always happy to help!
            </p>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://skyguide.app/chat" 
                 style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Start Using SkyGuide
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 40px;">
              Safe flights! ✈️<br>
              The SkyGuide Team
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Error sending welcome email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email", details: JSON.stringify(error) }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
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