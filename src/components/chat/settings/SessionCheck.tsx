import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function SessionCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session in SessionCheck component...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found in settings, redirecting to login");
          localStorage.clear();
          navigate('/login');
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          localStorage.clear();
          navigate('/login');
          return;
        }

        console.log("Valid session found for user:", user.email);
      } catch (error) {
        console.error("Unexpected error in session check:", error);
        localStorage.clear();
        navigate('/login');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in SessionCheck:", event, session?.user?.email);
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.clear();
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}