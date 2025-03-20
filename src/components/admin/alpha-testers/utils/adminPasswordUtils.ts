
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Sets a password for an existing user (useful for Google-authenticated users that need password login)
 * Only accessible by admin users
 */
export const setUserPassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    console.log("Setting password for user:", email);
    
    // Verify the current user is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.error("No active session");
      return false;
    }
    
    // Check if current user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || !adminProfile?.is_admin) {
      console.error("Not authorized to set passwords");
      return false;
    }
    
    // Get user to update
    const { data: userToUpdate, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError || !userToUpdate) {
      console.error("User not found:", email);
      return false;
    }
    
    // Use admin function to set user password
    const { error } = await supabase.functions.invoke('set-user-password', {
      body: { 
        userId: userToUpdate.id,
        newPassword
      }
    });
    
    if (error) {
      console.error("Error setting password:", error);
      throw error;
    }
    
    console.log("Password set successfully for:", email);
    return true;
  } catch (error) {
    console.error("Error in setUserPassword:", error);
    return false;
  }
};

/**
 * Function to add a password to an admin's own Google-authenticated account
 */
export const setAdminPassword = async (currentEmail: string, newPassword: string) => {
  try {
    console.log("Attempting to set admin password");
    
    // Call the edge function to set the password
    const { error } = await supabase.functions.invoke('set-admin-password', {
      body: { 
        email: currentEmail,
        password: newPassword
      }
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set password. Please contact support."
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Password set successfully. You can now log in with email and password."
    });
    return true;
  } catch (error) {
    console.error("Error setting admin password:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "An unexpected error occurred. Please try again."
    });
    return false;
  }
};
