import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  isPromoter?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing alpha tester welcome email request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, isPromoter } = await req.json() as WelcomeEmailRequest;
    console.log(`Sending ${isPromoter ? 'promoter' : 'welcome'} email to ${email}`);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const promoterContent = isPromoter ? `
      <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #2563eb;">🌟 You're now a SkyGuide Promoter!</h2>
        <p>As a promoter, you'll have additional responsibilities and benefits:</p>
        <ul>
          <li>Early access to major feature releases</li>
          <li>Direct communication channel with our development team</li>
          <li>Opportunity to influence product direction</li>
          <li>Special recognition in our community</li>
        </ul>
        <p>We'll be reaching out soon with more details about your enhanced role!</p>
      </div>
    ` : '';

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide Alpha Program <alpha@skyguide.site>",
        to: [email],
        subject: isPromoter ? "🌟 Welcome to the SkyGuide Promoter Program!" : "Welcome to the SkyGuide Alpha Testing Program!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to SkyGuide Alpha, ${fullName}!</h1>
            
            <p>Thank you for joining our alpha testing program. Your participation will help shape the future of SkyGuide and ensure we're building the best possible tool for aviation professionals.</p>
            
            ${promoterContent}

            <h2>What to Expect:</h2>
            
            <ul>
              <li><strong>Weekly Feedback:</strong> Every week, you'll receive an email requesting your feedback about your experience with SkyGuide.</li>
              <li><strong>Your Commitment:</strong> As an alpha tester, we ask that you respond to these weekly feedback requests to help us improve the platform.</li>
              <li><strong>Early Access:</strong> You'll get first access to new features and updates before they're released to the general public.</li>
            </ul>
            
            <p>Your first feedback request will arrive in about a week. Please take a few minutes to explore the platform and note any thoughts, suggestions, or issues you encounter.</p>
            
            <p>If you have any questions or run into any problems, you can reply directly to this email.</p>
            
            <p>Thank you for being part of our journey!</p>
            
            <p>Best regards,<br>The SkyGuide Team</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending welcome email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-alpha-welcome function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);