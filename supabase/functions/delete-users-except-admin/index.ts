
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

    const { adminEmail } = await req.json();
    console.log("Admin email to preserve:", adminEmail);

    if (!adminEmail) {
      throw new Error("adminEmail is required");
    }

    // First find all users except the admin
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error listing users:", usersError);
      throw usersError;
    }

    const usersToDelete = users.users.filter(user => 
      user.email !== adminEmail && 
      user.email?.toLowerCase() !== adminEmail.toLowerCase()
    );

    console.log(`Found ${usersToDelete.length} users to delete`);

    // Delete each user one by one
    const results = [];
    for (const user of usersToDelete) {
      try {
        console.log(`Attempting to delete user: ${user.email}`);

        // First delete all their data
        if (user.id) {
          // Delete sessions
          await supabase
            .from("sessions")
            .delete()
            .eq("user_id", user.id);

          // Delete messages
          await supabase
            .from("messages")
            .delete()
            .eq("user_id", user.id);

          // Delete conversations
          await supabase
            .from("conversations")
            .delete()
            .eq("user_id", user.id);

          // Delete notifications
          await supabase
            .from("notifications")
            .delete()
            .eq("user_id", user.id);

          // Delete cookie and disclaimer consents
          await supabase
            .from("cookie_consents")
            .delete()
            .eq("user_id", user.id);
            
          await supabase
            .from("disclaimer_consents")
            .delete()
            .eq("user_id", user.id);

          // Delete alpha tester records if they exist
          await supabase
            .from("alpha_testers")
            .delete()
            .eq("profile_id", user.id);

          // Delete any contract uploads
          const { data: uploads } = await supabase
            .from("contract_uploads")
            .select("file_path")
            .eq("user_id", user.id);
            
          if (uploads && uploads.length > 0) {
            await supabase.storage
              .from("contracts")
              .remove(uploads.map(upload => upload.file_path));
              
            await supabase
              .from("contract_uploads")
              .delete()
              .eq("user_id", user.id);
          }

          // Delete referrals
          await supabase
            .from("referrals")
            .delete()
            .eq("referrer_id", user.id);

          // Delete release note changes
          await supabase
            .from("release_note_changes")
            .delete()
            .eq("user_id", user.id);

          // Delete profile - this must be done after all dependent records
          await supabase
            .from("profiles")
            .delete()
            .eq("id", user.id);
        }

        // Make sure we actually delete the user from auth.users by using admin.deleteUser
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id,
          // Force hard delete to fully remove the user
          true
        );
        
        if (deleteError) {
          console.error(`Error deleting user ${user.email}:`, deleteError);
          results.push({ email: user.email, success: false, error: deleteError.message });
        } else {
          console.log(`Successfully deleted user: ${user.email}`);
          results.push({ email: user.email, success: true });
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        results.push({ 
          email: user.email, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${usersToDelete.length} users`,
        results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in delete-users-except-admin function:", error);
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
