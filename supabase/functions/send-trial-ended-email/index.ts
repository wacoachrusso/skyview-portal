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
  
  // Handle CORS preflight requests
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
        subject: 'Your Free Trial Has Ended - Continue Exploring with SkyGuide!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1f2c; margin-bottom: 20px;">Thank you for trying SkyGuide!</h2>
            
            <p>Hi ${name},</p>
            
            <p>Your free trial has come to an end, but your journey with SkyGuide doesn't have to stop here! 🚀</p>
            
            <p>With a SkyGuide subscription, you'll get:</p>
            <ul>
              <li>✈️ Unlimited contract queries</li>
              <li>⚡ Real-time contract interpretation</li>
              <li>📱 24/7 access on any device</li>
              <li>🔍 Advanced search capabilities</li>
              <li>📊 Personalized insights</li>
            </ul>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${req.headers.get('origin')}/?scrollTo=pricing-section" 
                 style="background-color: #fbbf24; color: #1a1f2c; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Pricing Plans
              </a>
            </div>
            
            <p>Join thousands of aviation professionals who trust SkyGuide for their contract navigation needs.</p>
            
            <p>Best regards,<br>The SkyGuide Team</p>
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