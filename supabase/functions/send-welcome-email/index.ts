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
        subject: "Welcome to SkyGuide - Your Professional Aviation Assistant",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #1a365d; padding: 20px;">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px; height: auto;"/>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear ${name || "Aviation Professional"},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Welcome to SkyGuide! We're excited to have you join our community of aviation professionals. Our platform is specifically designed to support your daily operations and enhance your professional capabilities in the aviation industry.
            </p>
            
            <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h2 style="color: #1a365d; margin-bottom: 15px;">What You Can Do with SkyGuide</h2>
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                <li style="margin-bottom: 10px;">✈️ Access comprehensive aviation resources</li>
                <li style="margin-bottom: 10px;">📚 Get instant answers to technical questions</li>
                <li style="margin-bottom: 10px;">🔍 Find relevant aviation regulations and procedures</li>
                <li style="margin-bottom: 10px;">📱 Available on any device, anywhere</li>
              </ul>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Our team is dedicated to supporting your aviation career and making your daily operations more efficient. If you have any questions, simply reply to this email - we're here to help!
            </p>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://skyguide.site/chat" 
                 style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Start Using SkyGuide
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px;">
                Safe flights! ✈️<br>
                The SkyGuide Team
              </p>
              <p style="color: #a0aec0; font-size: 12px;">
                © 2024 SkyGuide. All rights reserved.
              </p>
            </div>
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