
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistRequest {
  name: string;
  email: string;
  role: string;
  airline: string;
  phoneNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing waitlist confirmation request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, airline, phoneNumber } = await req.json() as WaitlistRequest;
    console.log(`Sending waitlist confirmation to ${email}`);

    // Send confirmation email to user
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide Pre-Launch <waitlist@skyguide.site>",
        reply_to: "alpha@skyguide.site",
        to: [email],
        subject: "You're on the SkyGuide Early Access Waitlist!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://skyguide.site/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" alt="SkyGuide Logo" style="width: 150px;">
            </div>
            <h2 style="color: #1a1f2c; text-align: center;">Thank You for Joining Our Waitlist!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up for early access to SkyGuide. We're excited to have you join us as one of our first 300 pre-launch testers.</p>
            <p>We've recorded your information:</p>
            <ul>
              <li><strong>Role:</strong> ${role}</li>
              <li><strong>Airline:</strong> ${airline}</li>
            </ul>
            <p>We'll reach out with more information soon about how to access your free account and start using SkyGuide.</p>
            <p>If you have any questions in the meantime, feel free to reply to this email.</p>
            <p>Looking forward to helping you navigate your union contract with ease!</p>
            <p>The SkyGuide Team</p>
          </div>
        `,
      }),
    });

    if (!userEmailRes.ok) {
      const error = await userEmailRes.text();
      console.error("Error sending user confirmation email:", error);
      throw new Error(`Failed to send user email: ${error}`);
    }

    // Send notification to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide Waitlist <notifications@skyguide.site>",
        to: ["admin@skyguide.site"],
        subject: "New Waitlist Signup",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1f2c;">New Waitlist Signup</h2>
            <p>A new user has joined the waitlist:</p>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</li>
              <li><strong>Role:</strong> ${role}</li>
              <li><strong>Airline:</strong> ${airline}</li>
            </ul>
          </div>
        `,
      }),
    });

    if (!adminEmailRes.ok) {
      console.error("Error sending admin notification:", await adminEmailRes.text());
      // Continue even if admin email fails
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in waitlist confirmation function:", error);
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
