import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FORWARD_TO_EMAIL = Deno.env.get("FORWARD_TO_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendWebhookPayload {
  type: string;
  data: {
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Webhook handler started");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature if provided
    const webhookSecret = req.headers.get("resend-webhook-secret");
    if (webhookSecret !== RESEND_WEBHOOK_SECRET) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Invalid webhook secret" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const payload: ResendWebhookPayload = await req.json();
    console.log("Received webhook payload:", payload);

    if (payload.type === "email.delivered") {
      // Forward the email using Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Forwarded <notifications@skyguide.site>",
          to: [FORWARD_TO_EMAIL!],
          subject: `Forwarded: ${payload.data.subject}`,
          html: `
            <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
              <p><strong>Original From:</strong> ${payload.data.from}</p>
              <p><strong>Original To:</strong> ${payload.data.to.join(", ")}</p>
              <p><strong>Subject:</strong> ${payload.data.subject}</p>
            </div>
            <div>
              ${payload.data.html || payload.data.text || "No content"}
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Error forwarding email:", error);
        throw new Error(`Failed to forward email: ${error}`);
      }

      console.log("Email forwarded successfully");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);