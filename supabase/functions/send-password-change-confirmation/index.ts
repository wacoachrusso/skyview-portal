import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Password change confirmation email handler started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, name }: EmailRequest = await req.json();
    console.log(`Processing password change confirmation email for: ${email}`);

    const displayName = name || email;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>Password Changed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
          </div>
          
          <h2>Password Changed Successfully</h2>
          
          <p>Hi ${displayName},</p>
          
          <p>This email confirms that your password was recently changed.</p>
          
          <p>If you did not make this change, please contact our support team immediately.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Thank you for being part of SkyGuide!</p>
            <p style="color: #1a365d; font-weight: bold;">The SkyGuide Team</p>
            <div style="margin-top: 20px; font-size: 12px;">
              <p>SkyGuide™ - Your Aviation Career Partner</p>
              <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
              <p>Need help? <a href="mailto:support@skyguide.site" style="color: #666; text-decoration: underline;">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Sending email via Resend API');
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <notifications@skyguide.site>",
        to: [email],
        subject: "Your Password Has Been Changed",
        html: html,
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
    console.error("Error in send-password-change-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);