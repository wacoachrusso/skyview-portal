
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  plan: string;
  footer: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing welcome email request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, plan, footer } = await req.json() as EmailRequest;
    console.log(`Sending welcome email to ${email} for ${name} with plan ${plan}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: "Welcome to SkyGuide - Your Aviation Career Partner!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
            </div>
            
            <h1 style="color: #1a365d;">Welcome aboard, ${name}! 🎉</h1>
            
            <p>We're thrilled to have you join the SkyGuide community! You've taken the first step towards enhancing your aviation career journey.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #1a365d; margin-top: 0;">Getting Started with SkyGuide</h2>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 12px;">
                  <strong>Access your dashboard</strong> - This is your central hub for all SkyGuide features
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Start a conversation</strong> - Ask questions about your union contract terms
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Explore past conversations</strong> - All your previous queries are saved for future reference
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Check notifications</strong> - We'll keep you updated on important information
                </li>
              </ol>
            </div>
            
            <h2 style="color: #1a365d; margin-top: 25px;">Here's what you can look forward to:</h2>
            
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin: 15px 0; padding-left: 25px; position: relative;">
                ✈️ <strong>Expert Guidance:</strong> Clear explanations of your union contract terms
              </li>
              <li style="margin: 15px 0; padding-left: 25px; position: relative;">
                📱 <strong>24/7 Accessibility:</strong> Get answers to your questions anytime, anywhere
              </li>
              <li style="margin: 15px 0; padding-left: 25px; position: relative;">
                🎯 <strong>Precise Information:</strong> Find exactly what you need with our smart search
              </li>
              <li style="margin: 15px 0; padding-left: 25px; position: relative;">
                🔄 <strong>Regular Updates:</strong> Stay current with the latest information
              </li>
            </ul>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1a365d; margin-top: 0;">Ready to get started?</h3>
              <p>Simply log in to your account to begin exploring. Our team is here to support you every step of the way!</p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="https://skyguide.site/dashboard" 
                  style="display: inline-block; background-color: #fbbf24; color: #1a365d; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Go to My Dashboard
                </a>
              </div>
            </div>

            <p style="margin-top: 25px;">Have questions? Need help getting started? Just reply to this email - we're here to help!</p>
            
            <p>Blue skies ahead,<br>The SkyGuide Team</p>
            
            ${footer}
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending welcome email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in welcome email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
