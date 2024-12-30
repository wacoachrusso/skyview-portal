import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  inviteUrl: string;
  inviterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteUrl, inviterName } = await req.json();
    console.log("Sending invite email to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: `${inviterName ? `${inviterName} invited you to` : "You're invited to"} join SkyGuide + 1 Month Free Premium!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Join SkyGuide</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1a365d 0%, #334155 100%); padding: 40px 20px; text-align: center;">
                  <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 180px; margin-bottom: 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Special Invitation + Free Premium Access!</h1>
                </div>
                
                <!-- Main Content -->
                <div style="padding: 40px 30px;">
                  <p style="color: #334155; font-size: 16px; margin-bottom: 25px;">
                    ${inviterName ? `<strong>${inviterName}</strong> thinks you'll love` : "You've been invited to join"} SkyGuide, 
                    your comprehensive aviation assistant platform. As a special welcome gift, you'll get:
                  </p>
                  
                  <!-- Benefits Box -->
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px;">
                      <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                      <span style="color: #1a365d; font-weight: 500;">1 Month FREE Premium Access</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 15px;">
                      <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                      <span style="color: #1a365d; font-weight: 500;">Instant Access to All Premium Features</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                      <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                      <span style="color: #1a365d; font-weight: 500;">Your Own Referral Benefits</span>
                    </div>
                  </div>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${inviteUrl}" 
                       style="display: inline-block; background-color: #D4AF37; color: #1a365d; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.3s ease;">
                      Claim Your Free Month
                    </a>
                  </div>
                  
                  <!-- Testimonial/Social Proof -->
                  <div style="background: linear-gradient(135deg, #1a365d 0%, #334155 100%); border-radius: 8px; padding: 25px; color: white; margin: 30px 0;">
                    <p style="font-style: italic; margin: 0; font-size: 15px;">
                      "SkyGuide has revolutionized how I access and understand my union contract. It's an indispensable tool for any aviation professional."
                    </p>
                    <p style="margin: 10px 0 0; font-weight: 500; font-size: 14px;">
                      - John D., Senior Pilot
                    </p>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                    This invitation expires in 24 hours. Don't miss out on your free premium access!
                  </p>
                  <div style="margin-top: 20px; color: #94a3b8; font-size: 12px;">
                    <p style="margin: 5px 0;">SkyGuide - Your Aviation Assistant</p>
                    <p style="margin: 5px 0;">© 2024 SkyGuide. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await res.json();
    console.log("Email API response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending invite email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);