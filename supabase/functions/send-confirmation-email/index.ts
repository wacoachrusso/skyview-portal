import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl } = await req.json();

    console.log("Sending confirmation email to:", email);
    console.log("Confirmation URL:", confirmationUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <onboarding@skyguide.site>",
        to: [email],
        subject: "Welcome to SkyGuide - Please Confirm Your Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://skyguide.app/lovable-uploads/1b59f0c5-ed32-40b6-8f90-f5f7df5fd474.png" 
                   alt="SkyGuide Logo" 
                   style="width: 200px; height: auto;"
              />
            </div>
            
            <h1 style="color: #1a365d; text-align: center; margin-bottom: 30px;">Welcome to SkyGuide!</h1>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up! To get started with your aviation journey, please confirm your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Confirm Email Address
              </a>
            </div>
            
            <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h2 style="color: #2d3748; margin-bottom: 15px;">What's Next?</h2>
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                <li style="margin-bottom: 10px;">✈️ Access our AI-powered aviation assistant</li>
                <li style="margin-bottom: 10px;">📚 Get instant answers to your aviation questions</li>
                <li style="margin-bottom: 10px;">💡 Receive personalized recommendations</li>
                <li style="margin-bottom: 10px;">🔔 Stay updated with important notifications</li>
              </ul>
            </div>
            
            <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 40px;">
              If you didn't create an account with SkyGuide, you can safely ignore this email.<br>
              This link will expire in 24 hours.
            </p>
          </div>
        `,
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
    console.error("Error in send-confirmation-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);