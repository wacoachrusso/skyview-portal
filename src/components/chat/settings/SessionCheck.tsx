
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionState } from "@/hooks/useSessionState";
import { useAuthStateHandler } from "@/hooks/useAuthStateHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function SessionCheck() {
  const { checkCurrentSession } = useSessionState();
  const { handleAuthStateChange } = useAuthStateHandler();
  const { initializeSession } = useSessionManagement();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log("Setting up auth and checking session...");
        
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found");
          navigate('/login');
          return;
        }

        // Check if user is on a protected route, verify session
        if (window.location.pathname.startsWith('/chat') || 
            window.location.pathname.startsWith('/dashboard') || 
            window.location.pathname.startsWith('/settings') ||
            window.location.pathname.startsWith('/account')) {
            
          try {
            await checkCurrentSession();
            await initializeSession();
          } catch (error) {
            console.error("Session verification failed:", error);
            navigate('/login');
            return;
          }
        }

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
