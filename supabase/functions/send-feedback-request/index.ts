import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing feedback request email process");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { data: testers, error: fetchError } = await supabase
      .from("alpha_testers")
      .select("email, full_name")
      .eq("status", "active")
      .eq("is_promoter", false);

    if (fetchError) throw fetchError;
    console.log(`Found ${testers?.length} active testers`);

    const emailPromises = testers?.map(async (tester) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SkyGuide Alpha Program <alpha@skyguide.site>",
          reply_to: "alpha@skyguide.site",
          to: [tester.email],
          subject: "Your Weekly SkyGuide Feedback Request",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>SkyGuide Weekly Feedback</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
                </div>
                
                <h1 style="color: #1a365d; text-align: center;">Hello ${tester.full_name || "Valued Tester"}!</h1>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p>Thank you for being part of our alpha testing program. Your feedback is crucial in shaping SkyGuide into the best possible tool for aviation professionals.</p>
                  
                  <p>Please take a moment to share your thoughts on your experience with SkyGuide this week:</p>
                  
                  <ul style="color: #1a365d;">
                    <li>Which features did you find most useful?</li>
                    <li>Did you encounter any issues or difficulties?</li>
                    <li>What improvements would you like to see?</li>
                    <li>Is there anything missing that would make your experience better?</li>
                  </ul>
                </div>
                
                <p style="text-align: center;">Simply reply to this email with your feedback!</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
                  <p>Thank you for helping us improve SkyGuide!</p>
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
        throw new Error(`Failed to send email to ${tester.email}: ${error}`);
      }

      return res.json();
    });

    const results = await Promise.allSettled(emailPromises || []);
    console.log("Email sending results:", results);

    return new Response(
      JSON.stringify({ message: "Feedback request emails sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-feedback-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);