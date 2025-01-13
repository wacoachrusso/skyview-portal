import { supabase } from "@/integrations/supabase/client";

export const verifyAdminStatus = async () => {
  console.log("Verifying admin status...");
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    throw new Error("No active session found");
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.error("Error checking admin status:", profileError);
    throw new Error("Failed to verify admin privileges");
  }

  if (!profile?.is_admin) {
    throw new Error("Only administrators can add testers");
  }

  return session.user.id;
};