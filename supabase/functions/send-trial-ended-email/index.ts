import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Processing trial ended email request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json() as EmailRequest;
    console.log(`Sending trial ended email to ${email}`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SkyGuide <notifications@skyguide.site>',
        to: [email],
        subject: 'Your Free Trial Has Ended - Choose Your SkyGuide Plan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1f2c; margin-bottom: 20px;">Time to Upgrade Your SkyGuide Experience!</h2>
            
            <p>Hi ${name},</p>
            
            <p>You've completed your free trial query with SkyGuide. Ready to unlock unlimited access? Choose the plan that works best for you:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1a1f2c; margin-top: 0;">Available Plans:</h3>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 15px 0; padding-left: 25px;">
                  🌟 <strong>Monthly Plan - $4.99/month</strong>
                  <br>Perfect for active flight crew
                </li>
                <li style="margin: 15px 0; padding-left: 25px;">
                  ⭐ <strong>Annual Plan - $49.88/year</strong>
                  <br>Best value - Save $10 annually
                </li>
              </ul>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${req.headers.get('origin')}/?scrollTo=pricing-section" 
                 style="background-color: #fbbf24; color: #1a1f2c; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Choose Your Plan
              </a>
            </div>
            
            <p>With a paid subscription, you'll get:</p>
            <ul>
              <li>✈️ Unlimited contract queries</li>
              <li>⚡ Advanced interpretation</li>
              <li>📱 24/7 access on any device</li>
              <li>🔍 Custom contract uploads</li>
              <li>💫 Premium features</li>
            </ul>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p>SkyGuide™ - Your Aviation Career Partner</p>
              <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
              <p>Need help? <a href="mailto:support@skyguide.site" style="color: #666; text-decoration: underline;">Contact Support</a></p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending trial ended email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);