import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  console.log("Processing welcome email request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, plan } = await req.json() as EmailRequest;
    console.log(`Sending welcome email to ${email} for ${name} with plan ${plan}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <skyguide32@gmail.com>",
        to: [email],
        subject: "Welcome to SkyGuide!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1f2c;">Welcome to SkyGuide, ${name}!</h1>
            <p>Thank you for joining SkyGuide. We're excited to have you on board!</p>
            <p>You've signed up for our ${plan} plan. Here's what you can expect:</p>
            <ul>
              <li>Access to our AI-powered contract analysis</li>
              <li>24/7 support</li>
              <li>Regular updates and improvements</li>
            </ul>
            <p>If you have any questions, simply reply to this email - we're here to help!</p>
            <p>Best regards,<br>The SkyGuide Team</p>
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