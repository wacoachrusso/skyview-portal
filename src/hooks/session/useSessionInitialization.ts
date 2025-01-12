import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createNewSession } from "./useSessionCreation";

export const useSessionInitialization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const initializeSession = async () => {
    try {
      console.log("Initializing session");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
        navigate('/login');
        return;
      }
      
      if (!session) {
        console.log("No active session found");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Store refresh token in localStorage and cookie with proper expiration
      if (session.refresh_token) {
        console.log("Storing refresh token");
        localStorage.setItem('sb-refresh-token', session.refresh_token);
        
        // Set refresh token cookie with secure attributes and proper expiration
        const sevenDays = 7 * 24 * 60 * 60;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; secure; samesite=strict; max-age=${sevenDays}`;
      }

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        console.log('No session token found, creating new session');
        await createNewSession(session.user.id);
      } else {
        // Validate existing session
        const { data: isValid } = await supabase
          .rpc('is_session_valid', {
            p_session_token: sessionToken
          });

        if (!isValid) {
          console.log('Session token invalid, creating new session');
          await createNewSession(session.user.id);
        } else {
          console.log('Session token valid');
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing session:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
      navigate('/login');
    }
  };

  return {
    isLoading,
    initializeSession
  };
};