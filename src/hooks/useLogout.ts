
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateSessionToken } from "@/services/session/invalidateSession";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      // Get current session token first
      const sessionToken = localStorage.getItem('session_token');
      
      // Invalidate the current session in our sessions table
      if (sessionToken) {
        console.log("Invalidating current session token:", sessionToken);
        await invalidateSessionToken(sessionToken);
      }

      // Clear all local storage before signing out
      console.log("Clearing local storage...");
      localStorage.clear();
      
      // Sign out from Supabase
      console.log("Signing out from Supabase...");
      await supabase.auth.signOut();

      console.log("Logout successful, redirecting to login page...");
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
        variant: "default",
      });
      
      // Force navigation to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error in logout process:", error);
      
      // Even if there's an error, ensure we clean up local state
      localStorage.clear();
      
      toast({
        title: "Logged out",
        description: "Your session has been cleared",
        variant: "default",
      });
      
      // Force navigation to login page
      window.location.href = "/login";
    }
  };

  return { handleLogout };
};
