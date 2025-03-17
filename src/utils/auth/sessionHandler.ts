
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

export const handleAuthSession = async (
  userId: string,
  createNewSession: (userId: string) => Promise<any>,
  navigate: NavigateFunction
) => {
  console.log("Creating new session for user:", userId);

  try {
    // Fetch user profile (optional, just for logging/debugging)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.warn("Warning: Unable to fetch user profile:", profileError);
    } else {
      console.log("Profile data:", profile);
    }

    // Create a new session
    const newSession = await createNewSession(userId);

    if (!newSession) {
      console.error("Failed to create new session");
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Failed to create a new session."
      });
      navigate('/login');
      return;
    }

    console.log("New session created successfully:", newSession);
    
  } catch (error) {
    console.error("Unexpected error in handleAuthSession:", error);
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: error.message || "An unexpected error occurred. Please try again."
    });
    navigate('/login');
  }
};

// Password reset handler
export const handlePasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Initiating password reset for:", email);
    
    const { error } = await supabase.functions.invoke('send-password-reset', {
      body: { 
        email,
        resetUrl: `${window.location.origin}/reset-password`
      }
    });

    if (error) {
      console.error("Password reset error:", error);
      return { 
        success: false, 
        error: error.message || "Failed to send password reset email" 
      };
    }

    console.log("Password reset email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in handlePasswordReset:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    };
  }
};
