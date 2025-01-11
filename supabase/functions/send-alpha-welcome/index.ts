import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  temporaryPassword: string;
  loginUrl: string;
  isPromoter?: boolean;
}

const getButtonStyle = () => `
  display: inline-block;
  background-color: #fbbf24;
  color: #1a365d;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
`;

const getCardStyle = () => `
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const getBaseEmailTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SkyGuide</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
      </div>
      ${content}
    </body>
  </html>
`;

const getWelcomeEmailContent = ({
  fullName,
  email,
  temporaryPassword,
  loginUrl,
  isPromoter,
}: WelcomeEmailRequest) => {
  const content = `
    <h1 style="color: #1a1f2c;">Welcome aboard, ${fullName}! 🎉</h1>
    
    <p>We're thrilled to have you join the SkyGuide ${isPromoter ? 'promoter' : 'alpha testing'} program!</p>
    
    <div style="${getCardStyle()}">
      <h3 style="color: #1a1f2c; margin-top: 0;">Your Login Credentials</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p style="color: #dc2626;">Please change your password after your first login!</p>
      <p><a href="${loginUrl}" style="${getButtonStyle()}">Login to SkyGuide</a></p>
    </div>

    ${isPromoter ? `
      <div style="${getCardStyle()}">
        <h3 style="color: #1a365d; margin-top: 0;">Your Role as a Promoter</h3>
        <ul style="color: #1a365d;">
          <li>Early access to major feature releases</li>
          <li>Direct communication with our development team</li>
          <li>Opportunity to influence product direction</li>
          <li>Special recognition in our community</li>
        </ul>
      </div>
    ` : `
      <div style="${getCardStyle()}">
        <h3 style="color: #1a365d; margin-top: 0;">What to Expect</h3>
        <ul style="color: #1a365d;">
          <li>Weekly feedback requests</li>
          <li>Early access to new features</li>
          <li>Direct impact on product development</li>
          <li>Regular updates on improvements</li>
        </ul>
      </div>
    `}

    <p style="margin-top: 25px;">Have questions? Need help getting started? Our support team is here to help!</p>
  `;

  return getBaseEmailTemplate(content);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing alpha tester welcome email request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json() as WelcomeEmailRequest;
    console.log(`Sending ${requestData.isPromoter ? 'promoter' : 'welcome'} email to ${requestData.email}`);

    const html = getWelcomeEmailContent(requestData);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: requestData.isPromoter 
          ? "SkyGuide Promoter Program <promoters@skyguide.site>"
          : "SkyGuide Alpha Tester Program <alpha@skyguide.site>",
        to: [requestData.email],
        subject: requestData.isPromoter ? "Welcome to the SkyGuide Promoter Program!" : "Welcome to SkyGuide Alpha Testing!",
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending welcome email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in welcome email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);