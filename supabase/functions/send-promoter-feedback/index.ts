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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Weekly Promoter Update</h1>
          
          <p>Hi ${promoter.full_name},</p>
          
          <p>Thank you for being a valued SkyGuide promoter! Your role in helping us grow is invaluable.</p>

          <h2>This Week's Promotion Tips:</h2>
          <ul>
            ${promotionTips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>

          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Weekly Feedback</h3>
            <p>Please take a moment to share your promotion activities:</p>
            
            <ol>
              <li>How many colleagues did you introduce to SkyGuide this week?</li>
              <li>How many signed up for monthly plans?</li>
              <li>How many signed up for yearly plans?</li>
              <li>What challenges did you face when promoting SkyGuide?</li>
              <li>What resources would help you be more effective in your promoter role?</li>
            </ol>

            <p>Reply directly to this email with your responses!</p>
          </div>

          <div style="background-color: #e8f4ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Share Your Success Story</h3>
            <p>Have a great promotion success story? We'd love to hear it! Your experiences can inspire other promoters and help us improve our platform.</p>
          </div>

          <p>Your dedication to growing the SkyGuide community is greatly appreciated!</p>
          
          <p>Best regards,<br>The SkyGuide Team</p>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SkyGuide Promoter Program <promoters@skyguide.site>",
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