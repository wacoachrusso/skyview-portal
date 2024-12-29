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

const formatPlanName = (plan: string): string => {
  switch (plan) {
    case 'monthly':
      return 'Monthly ($4.99/month)';
    case 'annual':
      return 'Annual ($49.99/year)';
    case 'free':
      return 'Free Trial';
    default:
      return plan;
  }
};

const getEmailContent = (oldPlan: string, newPlan: string, fullName: string = "User") => {
  console.log(`Generating email content for plan change: ${oldPlan} -> ${newPlan}`);
  
  const formattedOldPlan = formatPlanName(oldPlan);
  const formattedNewPlan = formatPlanName(newPlan);
  
  let subject = "";
  let preheader = "";
  let mainContent = "";
  let callToAction = "";

  if (oldPlan === "annual" && newPlan === "monthly") {
    subject = "Your SkyGuide Plan Change: Annual to Monthly";
    preheader = "Your subscription has been updated to our monthly plan";
    mainContent = `
      <p>We've processed your plan change from Annual to Monthly. Here's what you need to know:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>✓ Your new plan: ${formattedNewPlan}</li>
        <li>✓ Billing cycle: Monthly at $4.99</li>
        <li>✓ All premium features included</li>
      </ul>
    `;
    callToAction = "View Your Account";
  } else if (oldPlan === "monthly" && newPlan === "annual") {
    subject = "Thanks for Choosing Our Annual Plan! 🎉";
    preheader = "You're now saving $10 annually with our best value plan";
    mainContent = `
      <p>Great choice on switching to our annual plan! Here's what you get:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>✓ $10 annual savings</li>
        <li>✓ All premium features</li>
        <li>✓ Priority support</li>
      </ul>
      <p>Your new billing cycle: $49.99/year</p>
    `;
    callToAction = "Explore Premium Features";
  } else if (oldPlan === "free") {
    subject = "Welcome to SkyGuide Premium! 🚀";
    preheader = "Your account has been upgraded to premium";
    mainContent = `
      <p>Welcome to premium! You now have access to:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>✓ Unlimited contract queries</li>
        <li>✓ Priority support</li>
        <li>✓ Advanced features</li>
      </ul>
      <p>Your selected plan: ${formattedNewPlan}</p>
    `;
    callToAction = "Start Using Premium";
  }

  console.log(`Generated email subject: ${subject}`);

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>${subject}</title>
          <meta name="description" content="${preheader}" />
        </head>
        <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; width: 100%; background-color: #f6f9fc;">
            <tr>
              <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
              <td class="container" style="font-family: sans-serif; font-size: 16px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;">
                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                  <table role="presentation" class="main" style="border-collapse: separate; width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td class="wrapper" style="font-family: sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 30px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                          <tr>
                            <td align="center" style="padding-bottom: 30px;">
                              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" width="200" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;">
                            </td>
                          </tr>
                          <tr>
                            <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">
                              <h1 style="color: #2D3748; font-size: 24px; font-weight: bold; margin: 0 0 20px;">Hello ${fullName},</h1>
                              ${mainContent}
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; width: 100%; box-sizing: border-box; margin-top: 30px;">
                                <tbody>
                                  <tr>
                                    <td align="center" style="font-family: sans-serif; font-size: 16px; vertical-align: top; padding-bottom: 15px;">
                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: auto;">
                                        <tbody>
                                          <tr>
                                            <td style="font-family: sans-serif; font-size: 16px; vertical-align: top; border-radius: 8px; text-align: center; background-color: #0F172A;">
                                              <a href="https://skyguide.site/dashboard" target="_blank" style="border: solid 1px #0F172A; border-radius: 8px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 16px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; background-color: #0F172A; border-color: #0F172A; color: #ffffff;">${callToAction}</a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-top: 30px; color: #718096;">If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
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
  console.log("Plan change email handler started");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, oldPlan, newPlan, fullName }: EmailRequest = await req.json();
    console.log(`Processing plan change email for ${email}: ${oldPlan} -> ${newPlan}`);

    const { subject, html } = getEmailContent(oldPlan, newPlan, fullName);

    console.log("Sending email with subject:", subject);
    
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