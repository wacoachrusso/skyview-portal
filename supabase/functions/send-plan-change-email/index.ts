import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  oldPlan: string;
  newPlan: string;
  fullName?: string;
}

const getEmailContent = (oldPlan: string, newPlan: string, fullName: string = "User") => {
  let subject = "";
  let message = "";

  if (oldPlan === "free" && (newPlan === "monthly" || newPlan === "annual")) {
    subject = "Welcome to SkyGuide Premium!";
    message = `
      <p>Thank you for upgrading to premium, ${fullName}!</p>
      <p>You now have access to all premium features with your ${newPlan} plan. Here's what you can do now:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>✓ Unlimited contract queries</li>
        <li>✓ Priority support</li>
        <li>✓ Advanced features</li>
      </ul>
    `;
  } else if (oldPlan === "monthly" && newPlan === "annual") {
    subject = "Thanks for Choosing Annual!";
    message = `
      <p>Thank you for switching to our annual plan, ${fullName}!</p>
      <p>You're now saving $10 annually while keeping access to all premium features.</p>
    `;
  } else if (oldPlan === "annual" && newPlan === "monthly") {
    subject = "Plan Change Confirmation";
    message = `
      <p>Hello ${fullName},</p>
      <p>Your plan has been updated from annual to monthly. You'll continue to have access to all premium features.</p>
    `;
  }

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>${subject}</title>
        </head>
        <body style="background-color: #f6f9fc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; width: 100%; background-color: #f6f9fc;">
            <tr>
              <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
              <td class="container" style="font-family: sans-serif; font-size: 16px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;">
                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                  <table role="presentation" class="main" style="border-collapse: separate; width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
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
                              ${message}
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-top: 30px; color: #718096;">If you have any questions, please don't hesitate to contact our support team.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                      <tr>
                        <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #9ca3af; font-size: 12px; text-align: center;">
                          <span>© 2024 SkyGuide. All rights reserved.</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </td>
              <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
            </tr>
          </table>
        </body>
      </html>
    `
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, oldPlan, newPlan, fullName }: EmailRequest = await req.json();
    console.log(`Sending plan change email to ${email} for change from ${oldPlan} to ${newPlan}`);

    const { subject, html } = getEmailContent(oldPlan, newPlan, fullName);

    // Only send email if there's a subject (meaning it's a valid plan change scenario)
    if (subject) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SkyGuide <notifications@skyguide.site>",
          to: [email],
          subject,
          html,
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
    } else {
      console.log("No email sent - invalid plan change scenario");
      return new Response(JSON.stringify({ message: "No email required for this plan change" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in send-plan-change-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);