import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  subscriptionType: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing subscription feedback email request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, name, subscriptionType } = await req.json() as EmailRequest;
    console.log(`Sending feedback email to ${email} for ${subscriptionType} subscription`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <feedback@skyguide.site>",
        reply_to: "support@skyguide.site",
        to: [email],
        subject: "How's Your SkyGuide Experience?",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>SkyGuide Feedback Request</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <h1 style="color: #1a365d; text-align: center;">Hello ${name}!</h1>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Thank you for choosing SkyGuide as your aviation career partner. We hope you're finding value in your ${subscriptionType} subscription.</p>
                
                <p>We'd love to hear about your experience with SkyGuide:</p>
                
                <ul style="color: #1a365d;">
                  <li>How has SkyGuide helped you understand your contract terms?</li>
                  <li>What features do you find most useful?</li>
                  <li>Is there anything we could improve?</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://skyguide.site/feedback" 
                   style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Share Your Feedback
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                <p>Thank you for helping us improve SkyGuide!</p>
                <p style="color: #1a365d; font-weight: bold;">The SkyGuide Team</p>
                <div style="margin-top: 20px; font-size: 12px;">
                  <p>SkyGuide™ - Your Aviation Career Partner</p>
                  <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
                  <p>
                    <a href="mailto:support@skyguide.site" style="color: #666; text-decoration: underline;">
                      Contact Support
                    </a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending feedback email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Feedback email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in subscription feedback email function:", error);
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