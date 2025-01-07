import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");

    if (!email || !token) {
      throw new Error("Missing required parameters");
    }

    // Validate the token (hash of email + secret)
    const validToken = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(email + Deno.env.get("RESEND_WEBHOOK_SECRET"))
    );
    const validTokenHex = Array.from(new Uint8Array(validToken))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (token !== validTokenHex) {
      throw new Error("Invalid unsubscribe token");
    }

    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabaseClient
      .from("profiles")
      .update({ 
        email_notifications: false 
      })
      .eq("email", email);

    if (error) throw error;

    // Return success page HTML
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Successfully Unsubscribed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f5; }
            .container { max-width: 600px; margin: 40px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #1a365d; margin-bottom: 20px; }
            p { color: #4a5568; margin-bottom: 15px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo img { max-width: 200px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo">
            </div>
            <h1>Successfully Unsubscribed</h1>
            <p>You have been successfully unsubscribed from SkyGuide email notifications.</p>
            <p>If you change your mind, you can always re-enable notifications from your account settings.</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Error handling unsubscribe:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});