import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSessionCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking session validity");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsLoading(false);
            setIsAuthenticated(false);
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setIsLoading(false);
            setIsAuthenticated(false);
          }
          return;
        }

        console.log("Valid session found for user:", session.user.email);
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in checkSession:", error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      if (mounted) {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    });

    return () => {
      console.log("Session check cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, isAuthenticated };
};