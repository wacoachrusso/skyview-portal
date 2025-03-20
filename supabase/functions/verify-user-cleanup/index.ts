
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

    // Check for any remaining users in auth system
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error("Error listing auth users:", authError);
      throw authError;
    }

    const remainingAuthUsers = authUsers.users.filter(
      user => user.email !== adminEmail
    );

    // Check for any remaining profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email")
      .neq("email", adminEmail);

    if (profilesError) {
      console.error("Error listing profiles:", profilesError);
      throw profilesError;
    }

    // Check for orphaned data in other tables
    const tables = [
      "messages", "conversations", "notifications", "sessions", 
      "cookie_consents", "disclaimer_consents", "contract_uploads",
      "referrals", "release_note_changes", "alpha_testers"
    ];

    const orphanedData = {};
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .not("user_id", "eq", null);
        
      if (error) {
        console.error(`Error checking ${table}:`, error);
        orphanedData[table] = { error: error.message };
      } else {
        orphanedData[table] = data;
      }
    }

    // For each remaining auth user, try to force delete them
    const cleanupResults = [];
    if (remainingAuthUsers.length > 0) {
      for (const user of remainingAuthUsers) {
        try {
          console.log(`Attempting to clean up user: ${user.email}`);
          const { error } = await supabase.auth.admin.deleteUser(user.id, true);
          
          if (error) {
            cleanupResults.push({ 
              email: user.email, 
              success: false, 
              error: error.message 
            });
          } else {
            cleanupResults.push({ 
              email: user.email, 
              success: true 
            });
          }
        } catch (e) {
          cleanupResults.push({ 
            email: user.email, 
            success: false, 
            error: e instanceof Error ? e.message : "Unknown error" 
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        remainingAuthUsers: remainingAuthUsers.map(u => ({ id: u.id, email: u.email })),
        remainingProfiles: profiles,
        orphanedData,
        cleanupResults,
        adminEmail
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-user-cleanup function:", error);
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
