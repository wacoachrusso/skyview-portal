import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { userId } = await req.json();
    console.log("Attempting to delete user:", userId);

    if (!userId) {
      console.error("No userId provided");
      throw new Error("userId is required");
    }

    // First verify the user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Error getting user: ${userError.message}`);
    }
    
    if (!userData.user) {
      console.error("User not found");
      throw new Error("User not found");
    }

    // Delete the user from auth.users
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId, true);
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw new Error(`Database error deleting user: ${deleteError.message}`);
    }

    console.log("Successfully deleted user:", userId);

    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in delete-user-auth function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});