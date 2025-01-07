import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing promoter feedback request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Get active promoters from the database
    const { data: promoters, error: dbError } = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/alpha_testers?status=eq.active&is_promoter=eq.true&select=email,full_name`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
        },
      }
    ).then(res => res.json());

    if (dbError) throw dbError;

    console.log(`Sending promoter feedback emails to ${promoters.length} promoters`);

    const promotionTips = [
      "Share your personal experience with SkyGuide on professional networks",
      "Highlight specific features that have helped you in your work",
      "Connect with colleagues during training sessions or meetings",
      "Use social media to showcase how SkyGuide helps with contract understanding",
      "Create short video testimonials about your experience"
    ];

    // Send email to each promoter
    const emailPromises = promoters.map(async (promoter: any) => {
      const emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>SkyGuide Promoter Update</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
            </div>
            
            <h1 style="color: #1a365d; text-align: center;">Weekly Promoter Update</h1>
            
            <p style="color: #1a365d;">Hi ${promoter.full_name},</p>
            
            <p>Thank you for being a valued SkyGuide promoter! Your role in helping us grow is invaluable.</p>

            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #1a365d; margin-top: 0;">This Week's Promotion Tips:</h2>
              <ul style="color: #1a365d;">
                ${promotionTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>

            <div style="background-color: #e8f4ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #1a365d; margin-top: 0;">Weekly Feedback</h3>
              <p>Please share your promotion activities this week:</p>
              
              <ol style="color: #1a365d;">
                <li>How many colleagues did you introduce to SkyGuide?</li>
                <li>How many signed up for monthly plans?</li>
                <li>How many signed up for yearly plans?</li>
                <li>What challenges did you face when promoting SkyGuide?</li>
                <li>What resources would help you be more effective in your promoter role?</li>
              </ol>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #1a365d; margin-top: 0;">Share Your Success Story</h3>
              <p>Have a great promotion success story? We'd love to hear it! Your experiences can inspire other promoters and help us improve our platform.</p>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Your dedication to growing the SkyGuide community is greatly appreciated!</p>
              <p style="color: #1a365d; font-weight: bold;">The SkyGuide Team</p>
              <div style="margin-top: 20px; font-size: 12px;">
                <p>SkyGuide™ - Your Aviation Career Partner</p>
                <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SkyGuide Promoter Program <promoters@skyguide.site>",
          reply_to: "skyguide32@gmail.com",
          to: [promoter.email],
          subject: "🌟 Weekly SkyGuide Promoter Update & Feedback Request",
          html: emailContent,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error(`Error sending email to ${promoter.email}:`, error);
        return { email: promoter.email, success: false, error };
      }

      return { email: promoter.email, success: true };
    });

    const results = await Promise.all(emailPromises);
    console.log("Email sending results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-promoter-feedback function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);