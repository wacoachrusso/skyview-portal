import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting feedback request email process");
    const { data: testers, error: fetchError } = await supabase
      .from("alpha_testers")
      .select("email, full_name")
      .eq("status", "active");

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
          from: "SkyGuide Feedback <feedback@skyguide.site>",
          to: [tester.email],
          subject: "SkyGuide Weekly Feedback Request",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Hello ${tester.full_name || "Valued Tester"}!</h1>
              
              <p>We hope you've had a chance to explore SkyGuide this week. Your feedback is invaluable in helping us improve the platform.</p>
              
              <p>Please take a moment to share your thoughts:</p>
              
              <ul>
                <li>What features did you find most useful?</li>
                <li>Did you encounter any issues or difficulties?</li>
                <li>What improvements would you like to see?</li>
              </ul>
              
              <p>You can reply directly to this email with your feedback.</p>
              
              <p>Thank you for being part of our alpha testing program!</p>
              
              <p>Best regards,<br>The SkyGuide Team</p>
            </div>
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