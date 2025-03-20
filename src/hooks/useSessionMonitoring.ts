
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSessionToken } from "@/utils/sessionValidation";

export const useSessionMonitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Only set up monitoring if there's an active session token
    const currentToken = localStorage.getItem('session_token');
    if (!currentToken) return;

    const checkSession = async () => {
      // Check if we have a valid Supabase session first
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log("No active Supabase session, clearing session token");
        localStorage.removeItem('session_token');
        clearInterval(intervalRef.current!);
        return;
      }
      
      // Then validate our custom session token
      const isValid = await validateSessionToken(currentToken, { navigate, toast });
      if (!isValid) {
        console.log("Session token validation failed, cleaning up");
        localStorage.removeItem('session_token');
        clearInterval(intervalRef.current!);
      }
    };

    // Initial check
    checkSession();
    
    // Set up interval for periodic checks (every 2 minutes)
    intervalRef.current = window.setInterval(checkSession, 120000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate, toast]);
};
