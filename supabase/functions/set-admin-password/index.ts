
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request data
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Attempting to set password for: ${email}`);
    
    // Verify user exists and is an admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin')
      .eq('email', email)
      .single();
      
    if (profileError || !profile) {
      console.error("User not found:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (!profile.is_admin) {
      console.error("User is not an admin");
      return new Response(
        JSON.stringify({ error: "User is not an admin" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Set password for the admin user
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password }
    );
    
    if (error) {
      console.error("Error setting password:", error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Password set successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (err) {
    console.error("Error setting admin password:", err);
    
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
