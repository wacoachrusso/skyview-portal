import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAlphaStatusEmailContent } from "../../../src/utils/emailTemplates/alphaStatusEmail.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  fullName?: string;
  status: 'active' | 'inactive' | 'removed';
  isPromoterChange?: boolean;
  becamePromoter?: boolean;
  requiresPlan?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing alpha status change email");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const requestData: EmailRequest = await req.json();
    console.log("Sending status change email to:", requestData.email);

    const html = getAlphaStatusEmailContent({
      fullName: requestData.fullName || "Valued Member",
      status: requestData.status,
      isPromoterChange: requestData.isPromoterChange,
      becamePromoter: requestData.becamePromoter,
      requiresPlan: requestData.requiresPlan,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: requestData.isPromoterChange 
          ? "SkyGuide Promoter Program <promoters@skyguide.site>"
          : "SkyGuide Alpha Tester Program <alpha@skyguide.site>",
        reply_to: "skyguide32@gmail.com",
        to: [requestData.email],
        subject: `SkyGuide ${requestData.isPromoterChange ? 'Promoter' : 'Alpha Tester'} Status Update`,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error from Resend API:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending status change email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);