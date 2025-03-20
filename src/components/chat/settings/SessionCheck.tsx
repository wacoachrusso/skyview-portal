
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function SessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        
        // Simple session check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found");
          navigate('/login');
          return;
        }

        // If user is authenticated and on the root route, redirect to chat
        if (window.location.pathname === '/') {
          navigate('/chat');
        }

      } catch (error) {
        console.error("Session check error:", error);
        navigate('/login');
      }
    };

    checkSession();

    // Simple auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
}
