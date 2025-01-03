import { corsHeaders } from "./constants.ts";

export interface ResendWebhookPayload {
  type: string;
  data: {
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
  };
}

export const validateWebhookSecret = (
  receivedSecret: string | null,
  expectedSecret: string | null
): boolean => {
  console.log("Webhook secret verification:", {
    received: receivedSecret,
    matches: receivedSecret === expectedSecret
  });
  
  return receivedSecret === expectedSecret;
};

export const forwardEmail = async (
  payload: ResendWebhookPayload,
  RESEND_API_KEY: string,
  FORWARD_TO_EMAIL: string
): Promise<Response> => {
  console.log("Forwarding to:", FORWARD_TO_EMAIL);
  
  const forwardResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Forwarded <notifications@skyguide.site>",
      to: [FORWARD_TO_EMAIL],
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
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};