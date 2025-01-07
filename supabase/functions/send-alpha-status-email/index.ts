import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  fullName: string;
  status: 'active' | 'inactive' | 'removed';
  isPromoterChange?: boolean;
  becamePromoter?: boolean;
}

const getStatusMessage = (status: string, isPromoter = false) => {
  const statusMessages = {
    active: `You have been ${isPromoter ? "reactivated" : "activated"} as a ${isPromoter ? "SkyGuide Promoter" : "SkyGuide Alpha Tester"}. Welcome ${isPromoter ? "back " : ""}to the program! ${
      isPromoter 
        ? "You can now continue promoting SkyGuide and earning rewards."
        : "You can now continue testing and providing valuable feedback."
    }`,
    inactive: `Your ${isPromoter ? "promoter" : "alpha tester"} status has been temporarily set to inactive. During this time, you won't receive feedback requests or ${isPromoter ? "promoter updates" : "testing notifications"}. If you believe this was done in error, please contact our support team.`,
    removed: `Your participation in the ${isPromoter ? "promoter" : "alpha tester"} program has been discontinued. We appreciate your contributions to SkyGuide. If you believe this was done in error, please contact our support team.`,
  };
  return statusMessages[status as keyof typeof statusMessages];
};

const getPromoterChangeMessage = (becamePromoter: boolean) => {
  if (becamePromoter) {
    return `
      <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <h3 style="color: #1a365d; margin-top: 0;">Welcome to the SkyGuide Promoter Program!</h3>
        <p>You've been selected to become a SkyGuide Promoter! This means:</p>
        <ul style="color: #1a365d;">
          <li>You can now promote SkyGuide to your colleagues</li>
          <li>You'll receive weekly updates and resources</li>
          <li>You can earn rewards for successful referrals</li>
          <li>You'll have early access to new features</li>
        </ul>
        <p>We'll send you more details about the promoter program in a separate email.</p>
      </div>
    `;
  } else {
    return `
      <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <h3 style="color: #1a365d; margin-top: 0;">Status Update: Regular Alpha Tester</h3>
        <p>Your status has been changed from Promoter to Alpha Tester. This means:</p>
        <ul style="color: #1a365d;">
          <li>You'll continue to have access to all alpha testing features</li>
          <li>You'll receive regular testing feedback requests</li>
          <li>You won't receive promoter-specific updates anymore</li>
        </ul>
        <p>Thank you for your participation in the promoter program!</p>
      </div>
    `;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing alpha status change email");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, fullName, status, isPromoterChange, becamePromoter }: EmailRequest = await req.json();
    
    console.log("Sending status change email to:", email, {
      status,
      isPromoterChange,
      becamePromoter
    });

    const statusMessage = getStatusMessage(status, isPromoterChange);
    const promoterChangeContent = isPromoterChange ? getPromoterChangeMessage(becamePromoter!) : '';

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide Alpha Program <alpha@skyguide.site>",
        reply_to: "skyguide32@gmail.com",
        to: [email],
        subject: `SkyGuide ${isPromoterChange ? 'Promoter' : 'Alpha Tester'} Status Update`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>SkyGuide Status Update</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
              </div>
              
              <h1 style="color: #1a365d; text-align: center;">Status Update</h1>
              
              <p>Dear ${fullName || "Valued Member"},</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>${statusMessage}</p>
              </div>

              ${promoterChangeContent}
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                <p>Thank you for being part of SkyGuide!</p>
                <p style="color: #1a365d; font-weight: bold;">The SkyGuide Team</p>
                <div style="margin-top: 20px; font-size: 12px;">
                  <p>SkyGuide™ - Your Aviation Career Partner</p>
                  <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error from Resend API:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending status change email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);