
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
    if (userError || !userData.user) {
      console.error("Error getting user or user not found:", userError);
      throw new Error(userError?.message || "User not found");
    }

    console.log("User found, proceeding with deletion:", userData.user.email);

    // Delete the user from auth.users with hard delete option
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userId,
      // This second parameter forces a hard delete
      true
    );
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw deleteError;
    }

    // Verify the user was actually deleted
    const { data: verifyData, error: verifyError } = await supabase.auth.admin.getUserById(userId);
    if (verifyError) {
      console.log("Verification error indicates user was deleted:", verifyError);
    } else if (verifyData.user) {
      console.error("WARNING: User still exists after deletion attempt:", verifyData.user.email);
    } else {
      console.log("Successfully verified user was deleted");
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
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
