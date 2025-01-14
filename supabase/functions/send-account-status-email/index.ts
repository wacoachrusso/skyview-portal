import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  email: string;
  status: 'disabled' | 'suspended' | 'deleted' | 'active' | 'locked';
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Received request to send account status email');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { email, status, fullName = "User" }: EmailRequest = await req.json();
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
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>SkyGuide Account Status Update</title>
            </head>
            <body style="background-color: #f6f9fc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f6f9fc;">
                <tr>
                  <td style="padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 20px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" width="200" style="max-width: 100%;">
                      </div>
                      
                      <h1 style="color: #1a365d; text-align: center; margin-bottom: 30px;">Account Status Update</h1>
                      
                      <p style="color: #4a5568; margin-bottom: 15px;">Dear ${fullName},</p>
                      
                      <p style="color: #4a5568; margin-bottom: 15px;">${getStatusMessage(status)}</p>
                      
                      <p style="color: #4a5568; margin-bottom: 15px;">${getStatusAction(status)}</p>
                      
                      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                        <p>SkyGuide™ - Your Aviation Career Partner</p>
                        <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
                        <p>Need help? <a href="mailto:support@skyguide.site" style="color: #666;">Contact Support</a></p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
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
    console.error("Error sending account status email:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error
      }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

const getStatusMessage = (status: string) => {
  const statusMessages = {
    disabled: "Your account has been temporarily disabled. This is usually due to suspicious activity or a violation of our terms of service.",
    suspended: "Your account has been suspended due to suspicious activity or a violation of our terms of service.",
    deleted: "Your account has been deleted. All your data will be permanently removed from our servers.",
    active: "Your account has been reactivated. You can now log in and use all features of the platform.",
    locked: "Your account has been locked due to multiple failed login attempts or suspicious activity.",
  };
  return statusMessages[status as keyof typeof statusMessages] || "Your account status has been updated.";
};

const getStatusAction = (status: string) => {
  const statusActions = {
    disabled: "If you believe this was done in error, please contact our support team for assistance in reactivating your account.",
    suspended: "Our team will review your account and contact you with further information about the suspension.",
    deleted: "If you believe this was done in error, please contact our support team immediately.",
    active: "If you have any questions or concerns, please don't hesitate to contact our support team.",
    locked: "To unlock your account, please use the password reset option or contact our support team for assistance.",
  };
  return statusActions[status as keyof typeof statusActions] || "Please contact support if you have any questions.";
};

serve(handler);