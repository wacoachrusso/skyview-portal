
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { validateCurrentSession } from "@/utils/sessionValidation";
import { useSessionMonitoring } from "@/hooks/useSessionMonitoring";

export function SessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Set up continuous session monitoring
  useSessionMonitoring();

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        console.log("Checking auth in SessionCheck component");
        
        // Check if we have a valid session
        const session = await validateCurrentSession({ navigate, toast });
        if (!session && mounted) {
          console.log("No valid session, redirecting to login");
          navigate('/login');
          return;
        }
        
        // If we're at the root and have a valid session, redirect to chat
        if (window.location.pathname === '/' && mounted && session) {
          navigate('/chat');
        }
      } catch (error) {
        console.error("Error in SessionCheck:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "An unexpected error occurred. Please try again."
          });
          navigate('/login');
        }
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in SessionCheck:", event);
      
      if (event === 'SIGNED_OUT' && mounted) {
        console.log("User signed out, redirecting to login");
        localStorage.removeItem('session_token');
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
}
