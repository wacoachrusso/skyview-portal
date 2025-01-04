import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export const useSessionState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();

  const handleSessionError = async () => {
    console.log("Handling session error, cleaning up...");
    localStorage.clear();
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Session Error",
      description: "Your session has expired. Please log in again."
    });
    navigate('/login');
  };

  const checkCurrentSession = async () => {
    try {
      console.log("Checking session in SessionCheck component...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found, redirecting to login");
        localStorage.clear();
        navigate('/login');
        return;
      }

      // Create a new session (this will automatically invalidate other sessions)
      await createNewSession(session.user.id);

      // Verify the session is still valid
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Error getting user or no user found:", userError);
        await handleSessionError();
        return;
      }

      console.log("Valid session found for user:", user.email);
    } catch (error: any) {
      console.error("Unexpected error in session check:", error);
      await handleSessionError();
    }
  };

  return {
    handleSessionError,
    checkCurrentSession
  };
};