import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export const useAuthStateHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log("Auth state changed:", event, session?.user?.email);
    
    if (event === 'SIGNED_OUT' || !session) {
      console.log("User signed out or session ended");
      localStorage.clear();
      navigate('/login');
      return;
    }
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log("New sign-in detected, creating session...");
      try {
        // Store the refresh token
        if (session.refresh_token) {
          localStorage.setItem('supabase.refresh-token', session.refresh_token);
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
        }

        // Create a new session
        await createNewSession(session.user.id);

        // Check for active sessions
        const { data: activeSessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .neq('session_token', localStorage.getItem('session_token'));

        if (activeSessions && activeSessions.length > 0) {
          toast({
            variant: "default",
            title: "Active Session Detected",
            description: "You have been logged out from other devices for security."
          });
        }
      } catch (error) {
        console.error("Error handling sign-in:", error);
        localStorage.clear();
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Your session has expired. Please log in again."
        });
        navigate('/login');
      }
    }
  };

  return { handleAuthStateChange };
};