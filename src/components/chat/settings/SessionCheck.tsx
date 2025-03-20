
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionState } from "@/hooks/useSessionState";
import { useAuthStateHandler } from "@/hooks/useAuthStateHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { validateCurrentSession, validateSessionToken } from "@/utils/session";
import { checkProfileStatus } from "@/utils/session";
import { useSessionMonitoring } from "@/hooks/useSessionMonitoring";

export function SessionCheck() {
  const { checkCurrentSession } = useSessionState();
  const { handleAuthStateChange } = useAuthStateHandler();
  const { initializeSession } = useSessionManagement();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up continuous session monitoring
  useSessionMonitoring();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log("Setting up auth and checking session...");
        
        // Validate current session
        const session = await validateCurrentSession({ navigate, toast });
        if (!session) return;
       
        // Validate session token
        const currentToken = localStorage.getItem('session_token');
        const isTokenValid = await validateSessionToken(currentToken, { navigate, toast });
        if (!isTokenValid) return;

        await checkCurrentSession();
        await initializeSession();

        // Redirect to chat page if the user is authenticated and on the root route
        if (window.location.pathname === '/') {
          navigate('/chat');
        }

      } catch (error) {
        console.error("Unexpected error in setupAuth:", error);
        localStorage.clear();
        await supabase.auth.signOut();
        navigate('/login');
      }
    };

    setupAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [checkCurrentSession, handleAuthStateChange, initializeSession, navigate, toast]);

  return null;
}
