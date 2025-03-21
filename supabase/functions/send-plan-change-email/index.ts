
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getEmailTemplate } from "./emailTemplates.ts";
import { buildEmailHtml } from "./emailBuilder.ts";
import { EmailRequest } from "./types.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Plan change email handler started");
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, oldPlan, newPlan, fullName }: EmailRequest = await req.json();
    console.log(`Processing plan change email request:`, {
      email,
      oldPlan,
      newPlan,
      fullName,
      timestamp: new Date().toISOString()
    });

    const template = getEmailTemplate(oldPlan, newPlan, fullName);
    console.log(`Email template generated with subject: ${template.subject}`);

    const html = buildEmailHtml(template, fullName);
    console.log("Email HTML built successfully");
    
    console.log("Sending email via Resend API");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: template.subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error response from Resend:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-plan-change-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
