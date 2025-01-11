import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSessionCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          if (mounted) {
            await supabase.auth.signOut();
            localStorage.clear();
            setIsLoading(false);
            setIsAuthenticated(false);
          }
          return;
        }

        console.log("Valid session found for user:", user.email);
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in checkSession:", error);
        if (mounted) {
          localStorage.clear();
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();

    return () => {
      console.log("Session check cleanup");
      mounted = false;
    };
  }, []);

  return { isLoading, isAuthenticated };
};