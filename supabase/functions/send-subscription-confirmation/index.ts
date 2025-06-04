
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  plan: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting subscription confirmation email process");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing RESEND_API_KEY configuration");
    }

    const { email, name, plan } = await req.json();
    
    if (!email) {
      console.error("Missing required fields:", { email, plan });
      throw new Error("Missing required fields");
    }

    // Format plan name for display
    const planType = plan === 'monthly' ? 'Monthly' : 
                     plan === 'yearly' ? 'Annual' : 
                     plan === 'free' ? 'Free Trial' : plan;
    
    const price = plan === 'monthly' ? '$4.99/month' : 
                  plan === 'yearly' ? '$49.88/year' : 
                  'Free';

    console.log("Sending subscription confirmation email to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: `Your SkyGuide ${planType} Subscription is Active!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>SkyGuide Subscription Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <h1 style="color: #1a365d; text-align: center;">Thank You for Your Subscription!</h1>
              
              <p>Hello ${name || 'Valued Customer'},</p>
              
              <p>Thank you for subscribing to SkyGuide™! Your <strong>${planType} Plan (${price})</strong> is now active.</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1a365d;">Your Subscription Includes:</h3>
                <ul style="padding-left: 20px;">
                  ${plan !== 'free' ? `
                  <li>Unlimited contract queries</li>
                  <li>Advanced interpretation features</li>
                  <li>Priority support</li>
                  <li>Downloadable conversations</li>
                  <li>Premium features</li>
                  ` : `
                  <li>1 contract query</li>
                  <li>Basic contract interpretation</li>
                  <li>24/7 assistance</li>
                  <li>Mobile app access</li>
                  `}
                </ul>
              </div>
              
              <p>You can now log in and start using SkyGuide™ to interpret your union contract with advanced intelligent assistance.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://skyguide.site/chat" 
                   style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Start Using SkyGuide Now
                </a>
              </div>
              
              <p>If you have any questions about your subscription or need assistance using SkyGuide™, please don't hesitate to contact our support team at <a href="mailto:support@skyguide.site">support@skyguide.site</a>.</p>
              
              <p>Thank you for trusting SkyGuide™ with your contract interpretation needs!</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                <p>SkyGuide™ - Your Aviation Assistant</p>
                <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending subscription confirmation email:", error);
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Subscription confirmation email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-subscription-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
