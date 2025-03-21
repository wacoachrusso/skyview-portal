
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing RESEND_API_KEY configuration");
    }

    const { email, userId } = await req.json() as EmailRequest;
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Sending payment confirmation email to ${email}`);

    // First get the profile to get their subscription details
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/profiles?id=eq.${userId}&select=full_name,subscription_plan`, {
      headers: {
        "Content-Type": "application/json",
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user profile: ${await res.text()}`);
    }

    const profiles = await res.json();
    const profile = profiles[0] || { full_name: "Valued Customer", subscription_plan: "monthly" };
    
    const planName = profile.subscription_plan === "annual" ? "Annual" : "Monthly";
    const fullName = profile.full_name || "Valued Customer";

    // Send the confirmation email
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: `Thank You for Your SkyGuide ${planName} Subscription!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Subscription Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <h1 style="color: #1a365d; text-align: center;">Thank You for Your Subscription!</h1>
              
              <p style="margin-bottom: 20px;">Dear ${fullName},</p>
              
              <p style="margin-bottom: 20px;">Thank you for subscribing to SkyGuide's ${planName} Plan! Your payment has been successfully processed, and your subscription is now active.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="color: #1a365d; margin-top: 0;">Your Subscription Details</h2>
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p style="margin-bottom: 20px;">You now have full access to all SkyGuide features. To get started, simply log in to your account and begin exploring your union contract details.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://skyguide.site/chat" 
                   style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Start Using SkyGuide
                </a>
              </div>
              
              <p style="margin-bottom: 20px;">If you have any questions about your subscription or need assistance, please don't hesitate to contact our support team by replying to this email.</p>
              
              <p style="margin-bottom: 20px;">Thank you for choosing SkyGuide as your airline contract assistant!</p>
              
              <p>Best regards,<br>The SkyGuide Team</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                <p>SkyGuide™ - Your Aviation Career Partner</p>
                <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
                <p>Need help? <a href="mailto:alpha@skyguide.site" style="color: #666; text-decoration: underline;">Contact Support</a></p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Error sending confirmation email:", error);
      throw new Error(`Failed to send confirmation email: ${error}`);
    }

    const data = await emailResponse.json();
    console.log("Payment confirmation email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-payment-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
