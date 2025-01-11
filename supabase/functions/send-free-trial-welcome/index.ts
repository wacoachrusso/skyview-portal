import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  console.log("Processing free trial welcome email request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json() as EmailRequest;
    console.log(`Sending free trial welcome email to ${email}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: "Welcome to Your SkyGuide Free Trial!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
            </div>
            
            <h1 style="color: #1a1f2c;">Welcome aboard, ${name}! 🎉</h1>
            
            <p>We're thrilled to have you join the SkyGuide community! You've taken the first step towards enhancing your aviation career journey.</p>
            
            <h2 style="color: #1a1f2c; margin-top: 25px;">Here's what you can look forward to:</h2>
            
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
              <h3 style="color: #1a1f2c; margin-top: 0;">Your Free Trial Details</h3>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 10px 0;">✨ You have <strong>1 contract query</strong> to explore SkyGuide</li>
                <li style="margin: 10px 0;">🎯 Make it count! Ask something specific about your contract</li>
                <li style="margin: 10px 0;">⚡ Get instant, accurate answers about your union agreement</li>
              </ul>
            </div>

            <p style="margin-top: 25px;">Ready to get started? Simply log in to your account and begin exploring. Our team is here to support you every step of the way!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${req.headers.get('origin')}/?scrollTo=pricing-section" 
                 style="background-color: #fbbf24; color: #1a1f2c; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Pricing Plans
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p>SkyGuide™ - Your Aviation Career Partner</p>
              <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
              <p>Need help? <a href="mailto:support@skyguide.site" style="color: #666; text-decoration: underline;">Contact Support</a></p>
            </div>
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