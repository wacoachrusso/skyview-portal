
import { supabase } from "@/integrations/supabase/client";

export const verifyAdminStatus = async () => {
  console.log("Verifying admin status...");
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    throw new Error("No active session found");
  }

  // First, try to get admin status from client
  console.log("Fetching user data for", session.user.email);
  
  // Get the user's profile directly with a service role query
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin, email, id')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.error("Error checking admin status:", profileError);
    throw new Error("Failed to verify admin privileges");
  }

  console.log("Admin verification result:", profile);

  if (!profile?.is_admin) {
    throw new Error("Only administrators can access this section");
  }

  return session.user.id;
};

// Direct SQL function to set admin status, as a last resort
export const forceSetAdminStatus = async (email: string) => {
  try {
    console.log("Force setting admin status for email:", email);
    
    // Get user ID from email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError) {
      console.error("Error finding user:", userError);
      return false;
    }
    
    if (!user?.id) {
      console.error("User not found with email:", email);
      return false;
    }
    
    // Update admin status directly
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        subscription_plan: 'monthly'
      })
      .eq('id', user.id);
      
    if (error) {
      console.error("Error updating admin status:", error);
      return false;
    }
    
    console.log("Successfully set admin status for:", email);
    return true;
  } catch (error) {
    console.error("Error in forceSetAdminStatus:", error);
    return false;
  }
};
