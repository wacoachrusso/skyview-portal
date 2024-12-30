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

    const fromEmail = "onboarding@skyguide.site";
    const firstName = name?.split(' ')[0] || "Aviation Professional";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Welcome to SkyGuide – Your Journey Starts Here!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; background-color: #1a365d; padding: 20px;">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px; height: auto;"/>
            </div>
            
            <h1 style="color: #1a365d; text-align: center; font-size: 24px; margin-bottom: 30px;">
              Welcome to SkyGuide™ - Unlock a World of Insights at Your Fingertips
            </h1>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We're thrilled to welcome you to SkyGuide™! Your one-stop solution for all your union contract-related needs is now just a tap away.
            </p>
            
            <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h2 style="color: #1a365d; margin-bottom: 15px;">Here's what you can look forward to:</h2>
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                <li style="margin-bottom: 10px;">✨ Quick Answers: No more flipping through pages—find what you need instantly.</li>
                <li style="margin-bottom: 10px;">📝 Streamlined Grievances: Submit and track your issues with ease.</li>
                <li style="margin-bottom: 10px;">👥 Union Contact Hub: Access reps and resources when you need them most.</li>
              </ul>
            </div>

            <div style="background-color: #D4AF37; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <h2 style="color: #1a365d; margin-bottom: 15px;">Refer & Earn Free Premium Access! 🎁</h2>
              <p style="color: #1a365d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Share SkyGuide™ with your colleagues and both get a free month of premium access when they sign up!
              </p>
              <a href="https://skyguide.site/?scrollTo=referral" 
                 style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Send Invites Now
              </a>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Let's get started! Log in today and explore how SkyGuide™ can make your work-life simpler, faster, and more organized.
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your success in the skies begins here.
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Warm regards,<br>
              The SkyGuide™ Team
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://skyguide.site/login" 
                 style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Log In Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-style: italic;">
                P.S. Got questions? Our team is here to help at support@skyguide.site
              </p>
              <p style="color: #a0aec0; font-size: 12px;">
                SkyGuide™ - Your Aviation Assistant<br>
                © 2024 SkyGuide. All rights reserved.<br>
                <a href="https://skyguide.site/privacy-policy" style="color: #a0aec0; text-decoration: underline;">Privacy Policy</a> • 
                <a href="https://skyguide.site/terms" style="color: #a0aec0; text-decoration: underline;">Terms of Service</a>
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
