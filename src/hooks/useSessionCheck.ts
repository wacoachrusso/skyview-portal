import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSessionCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

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
            toast({
              variant: "destructive",
              title: "Session Error",
              description: "There was a problem with your session. Please log in again."
            });
            navigate('/login');
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setIsLoading(false);
            toast({
              variant: "destructive",
              title: "Session Required",
              description: "Please log in to access this page."
            });
            navigate('/login');
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
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Could not verify your identity. Please log in again."
            });
            navigate('/login');
          }
          return;
        }

        console.log("Valid session found for user:", user.email);
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in checkSession:", error);
        if (mounted) {
          localStorage.clear();
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred. Please try again."
          });
          navigate('/login');
        }
      }
    };

    checkSession();

    return () => {
      console.log("Session check cleanup");
      mounted = false;
    };
  }, [navigate, toast]);

  return { isLoading };
};