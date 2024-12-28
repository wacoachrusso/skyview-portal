import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  status: 'disabled' | 'suspended' | 'deleted' | 'active';
}

const getEmailContent = (status: string) => {
  const statusMessages = {
    disabled: "Your account has been temporarily disabled. This is usually due to suspicious activity or a violation of our terms of service.",
    suspended: "Your account has been suspended due to suspicious activity or a violation of our terms of service.",
    deleted: "Your account has been deleted. All your data will be permanently removed from our servers.",
    active: "Your account has been reactivated. You can now log in and use all features of the platform.",
  };

  const statusActions = {
    disabled: "If you believe this was done in error, please contact our support team for assistance in reactivating your account.",
    suspended: "Our team will review your account and contact you with further information about the suspension.",
    deleted: "If you believe this was done in error, please contact our support team immediately.",
    active: "If you have any questions or concerns, please don't hesitate to contact our support team.",
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a365d;">Account Status Update</h1>
      <p>${statusMessages[status as keyof typeof statusMessages]}</p>
      <p>${statusActions[status as keyof typeof statusActions]}</p>
      <p style="color: #666;">For security reasons, if you need to contact support, please use a different email address than your account email.</p>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, status }: EmailRequest = await req.json();
    console.log(`Sending account status email to ${email} for status: ${status}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: `SkyGuide Account Status Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: getEmailContent(status),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-account-status-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);