
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

interface RequestBody {
  email: string;
  redirectUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Password reset function invoked");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    console.log("Environment check:", {
      supabaseUrl: supabaseUrl ? "✅ Present" : "❌ Missing",
      supabaseServiceKey: supabaseServiceKey ? "✅ Present" : "❌ Missing",
      resendApiKey: resendApiKey ? "✅ Present" : "❌ Missing"
    });
    
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error("Missing required environment variables");
    }
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    const { email, redirectUrl } = requestData as RequestBody;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Processing password reset for email:", email);
    console.log("Redirect URL:", redirectUrl || "not provided");

    // Get the Site URL from environment or use a fallback domain
    const siteUrl = Deno.env.get("SITE_URL") || "https://skyguide.site";
    // Ensure we use an absolute URL for the reset password page
    const resetPasswordPath = "/reset-password";
    // Combine to get the final redirect URL
    const finalRedirectUrl = `${siteUrl}${resetPasswordPath}`;
    
    console.log("Final redirect URL:", finalRedirectUrl);

    // Generate password reset link with redirect to reset password page
    // Include the email parameter in the redirect URL
    const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${finalRedirectUrl}?email=${encodeURIComponent(email)}`
      }
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw resetError;
    }

    if (!data || !data.properties || !data.properties.action_link) {
      throw new Error("No reset link generated");
    }

    // Log the entire action link for debugging
    console.log("Reset link generated:", data.properties.action_link);
    
    const emailFooter = await getEmailFooter(email);

    const resend = new Resend(resendApiKey);
    
    // Send custom email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "SkyGuide <no-reply@skyguide.site>",
      to: email,
      subject: "Reset Your SkyGuide Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a365d;">
                <img src="https://skyguide.site/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" alt="SkyGuide Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #1a365d; margin: 0;">Reset Your Password</h1>
              </div>
              
              <div style="padding: 20px 0;">
                <p>Hello,</p>
                <p>We received a request to reset your password for your SkyGuide account. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.properties.action_link}" 
                     style="display: inline-block; padding: 12px 24px; background-color: #1a365d; color: #ffffff; text-decoration: none; border-radius: 4px;">
                    Reset Password
                  </a>
                </div>
                
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>For security, this link will expire in 24 hours.</p>
                
                <p>Best regards,<br>The SkyGuide Team</p>
              </div>
              
              ${emailFooter}
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Password reset email sent successfully:", emailData);
    
    return new Response(
      JSON.stringify({ 
        message: "Password reset email sent successfully",
        emailId: emailData.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing password reset:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error sending recovery email" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
