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
  fullName?: string;
}

const getEmailContent = (status: string, fullName: string) => {
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
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>SkyGuide Account Status Update</title>
        <style>
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important;
            }
            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span {
              font-size: 16px !important;
            }
            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body style="background-color: #f6f9fc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; width: 100%; background-color: #f6f9fc;">
          <tr>
            <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 16px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;">
              <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main" style="border-collapse: separate; width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                        <tr>
                          <td align="center" style="padding-bottom: 30px;">
                            <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" width="200" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;">
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">
                            <h1 style="color: #1a365d; font-family: sans-serif; font-weight: 600; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center;">Account Status Update</h1>
                            <p style="font-family: sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #4a5568;">Dear ${fullName},</p>
                            <p style="font-family: sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #4a5568;">${statusMessages[status as keyof typeof statusMessages]}</p>
                            <p style="font-family: sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #4a5568;">${statusActions[status as keyof typeof statusActions]}</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-top: 30px; color: #718096;">For security reasons, if you need to contact support, please use a different email address than your account email.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- START FOOTER -->
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                    <tr>
                      <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #9ca3af; font-size: 12px; text-align: center;">
                        <span>SkyGuide™ - Your Aviation Assistant</span><br>
                        <span>© 2024 SkyGuide. All rights reserved.</span>
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- END FOOTER -->
              </div>
            </td>
            <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        html: getEmailContent(status, fullName),
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