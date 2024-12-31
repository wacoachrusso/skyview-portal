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
    // Log environment variables (excluding sensitive parts)
    console.log("Environment check:", {
      hasWebhookSecret: !!RESEND_WEBHOOK_SECRET,
      hasApiKey: !!RESEND_API_KEY,
      hasForwardEmail: !!FORWARD_TO_EMAIL,
    });

    // Verify webhook signature
    const webhookSecret = req.headers.get("resend-webhook-secret");
    console.log("Received webhook secret:", webhookSecret ? "Present" : "Missing");
    
    if (webhookSecret !== RESEND_WEBHOOK_SECRET) {
      console.error("Invalid webhook secret");
      console.log("Expected:", RESEND_WEBHOOK_SECRET);
      console.log("Received:", webhookSecret);
      return new Response(
        JSON.stringify({ error: "Invalid webhook secret" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const payload: ResendWebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    if (payload.type === "email.delivered") {
      console.log("Processing email.delivered event");
      
      // Forward the email using Resend
      const forwardResponse = await fetch("https://api.resend.com/emails", {
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

      const responseText = await forwardResponse.text();
      console.log("Forward response status:", forwardResponse.status);
      console.log("Forward response body:", responseText);

      if (!forwardResponse.ok) {
        console.error("Error forwarding email:", responseText);
        throw new Error(`Failed to forward email: ${responseText}`);
      }

      console.log("Email forwarded successfully");
    } else {
      console.log("Ignoring non-delivery event:", payload.type);
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