import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePeriodicValidation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const intervalRef = useRef<number>();

  const startPeriodicValidation = () => {
    console.log("Starting periodic session validation");
    intervalRef.current = window.setInterval(async () => {
      const currentToken = localStorage.getItem('session_token');
      if (!currentToken) return;

      const { data: stillValid } = await supabase
        .rpc('is_session_valid', {
          p_session_token: currentToken
        });

      if (!stillValid) {
        console.log("Session invalidated during periodic check");
        clearInterval(intervalRef.current);
        localStorage.clear();
        await supabase.auth.signOut();
        toast({
          title: "Session Ended",
          description: "Your session has expired or been invalidated."
        });
        navigate('/login');
      }
    }, 30000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { startPeriodicValidation };
};