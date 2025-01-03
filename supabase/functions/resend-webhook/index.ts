import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./constants.ts";
import { validateWebhookSecret, forwardEmail, type ResendWebhookPayload } from "./utils.ts";

const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FORWARD_TO_EMAIL = "skyguide32@gmail.com";

const handler = async (req: Request): Promise<Response> => {
  console.log("========== Webhook Handler Started ==========");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
  console.log("Forward email configured:", FORWARD_TO_EMAIL);
  console.log("Has webhook secret:", !!RESEND_WEBHOOK_SECRET);
  console.log("Has API key:", !!RESEND_API_KEY);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    console.log("Raw request body:", bodyText);
    
    const payload: ResendWebhookPayload = JSON.parse(bodyText);
    console.log("Parsed webhook payload:", JSON.stringify(payload, null, 2));

    const webhookSecret = req.headers.get("resend-webhook-secret");
    if (!validateWebhookSecret(webhookSecret, RESEND_WEBHOOK_SECRET)) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Invalid webhook secret" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (payload.type === "email.delivered") {
      console.log("Processing email.delivered event");
      return await forwardEmail(payload, RESEND_API_KEY!, FORWARD_TO_EMAIL);
    } else {
      console.log("Ignoring non-delivery event:", payload.type);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in webhook handler:", error);
    console.error("Stack trace:", error.stack);
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