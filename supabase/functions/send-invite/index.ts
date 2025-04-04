
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate unsubscribe link
const generateUnsubscribeLink = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email + Deno.env.get("RESEND_WEBHOOK_SECRET"));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
};

// Generate email footer
const getEmailFooter = async (email: string): Promise<string> => {
  const unsubscribeLink = await generateUnsubscribeLink(email);
  
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p>SkyGuide™ - Your Aviation Career Partner</p>
      <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
      <p style="margin-top: 20px;">
        <a href="${unsubscribeLink}" style="color: #666; text-decoration: underline;">
          Unsubscribe from these emails
        </a>
      </p>
    </div>
  `;
};

interface EmailRequest {
  email: string;
  inviteUrl: string;
  inviterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing invite email request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteUrl, inviterName } = await req.json() as EmailRequest;
    console.log(`Sending invite email to ${email} from ${inviterName || "anonymous"}`);
    console.log("Invite URL:", inviteUrl);

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailFooter = await getEmailFooter(email);

    console.log("Sending email via Resend API");
    const { data, error } = await resend.emails.send({
      from: "SkyGuide <notifications@skyguide.site>",
      to: [email],
      subject: `${inviterName ? `${inviterName} thinks you'll love` : "Discover"} SkyGuide - Your Contract Assistant + Special Reward Offer!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Join SkyGuide</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1a365d 0%, #334155 100%); padding: 40px 20px; text-align: center;">
                <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 180px; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Transform How You Navigate Your Contract</h1>
              </div>
              
              <!-- Main Content -->
              <div style="padding: 40px 30px;">
                <p style="color: #334155; font-size: 16px; margin-bottom: 25px;">
                  ${inviterName ? `<strong>${inviterName}</strong> thinks you'll love` : "You've been invited to try"} SkyGuide, 
                  your professional contract assistant that's revolutionizing how aviation professionals understand and manage their contracts.
                </p>
                
                <!-- Special Offer Box -->
                <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: center;">
                  <h2 style="color: #1a365d; margin: 0 0 15px; font-size: 24px;">Special Reward Offer</h2>
                  <div style="background-color: white; border-radius: 6px; padding: 20px; margin-top: 15px;">
                    <p style="color: #1a365d; font-size: 16px; margin: 0 0 10px;">
                      <strong>Here's how the rewards work:</strong>
                    </p>
                    <ul style="color: #1a365d; text-align: left; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">Get 50% off your first month</li>
                      <li style="margin-bottom: 8px;">OR an extra free month with annual plan</li>
                      <li style="margin-bottom: 8px;">Your friend gets rewarded too!</li>
                      <li>Both rewards are automatically applied</li>
                    </ul>
                  </div>
                </div>
                
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                  <h2 style="color: #1a365d; font-size: 20px; margin-top: 0; margin-bottom: 20px;">Why Aviation Professionals Love SkyGuide:</h2>
                  
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                    <span style="color: #1a365d; font-weight: 500;">Get instant, accurate answers about your contract rights</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                    <span style="color: #1a365d; font-weight: 500;">Save hours researching contract clauses and rules</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                    <span style="color: #1a365d; font-weight: 500;">Make informed decisions about your schedule and rights</span>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <span style="background-color: #D4AF37; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold;">✓</span>
                    <span style="color: #1a365d; font-weight: 500;">Available 24/7, just like your schedule</span>
                  </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${inviteUrl}" 
                     style="display: inline-block; background-color: #1a365d; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px; transition: background-color 0.3s ease;">
                    Get Started Now
                  </a>
                </div>
              </div>
              
              ${emailFooter}
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error from Resend API:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending invite email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
