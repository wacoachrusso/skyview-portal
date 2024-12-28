import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting confirmation email process");
    console.log("RESEND_API_KEY present:", !!RESEND_API_KEY);

    const { email, confirmationUrl } = await req.json();
    
    console.log("Received request data:", { email, confirmationUrl });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to SkyGuide - Confirm Your Email",
        html: `
          <h2>Welcome to SkyGuide!</h2>
          <p>Thank you for signing up. Please click the link below to confirm your email address:</p>
          <p><a href="${confirmationUrl}">Confirm Email Address</a></p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
        `,
      }),
    });

    const responseText = await res.text();
    console.log("Resend API response:", responseText);

    if (!res.ok) {
      console.error("Error from Resend API:", responseText);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email" }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Confirmation email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);