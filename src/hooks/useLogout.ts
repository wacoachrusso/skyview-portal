import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      // Get current session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("Found active session, invalidating...");
        // Invalidate the current session in our sessions table
        const { error: sessionError } = await supabase
          .from('sessions')
          .update({
            status: 'invalidated',
            invalidated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

        if (sessionError) {
          console.error("Error invalidating session:", sessionError);
        }
      }

      // Clear all local storage
      console.log("Clearing local storage...");
      localStorage.clear();
      
      // Sign out from Supabase (globally)
      console.log("Signing out from Supabase...");
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' 
      });
      
      if (error) {
        console.error("Error during signOut:", error);
        throw error;
      }

      console.log("Logout successful, redirecting to login page...");
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out from all devices",
      });
      
      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error in logout process:", error);
      
      // Even if there's an error, ensure we clean up local state
      localStorage.clear();
      
      toast({
        title: "Session ended",
        description: "Your session has been cleared",
        variant: "default",
      });
      
      navigate("/login", { replace: true });
    }
  };

  return { handleLogout };
};