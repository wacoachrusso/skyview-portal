import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createNewSession, invalidateAllUserSessions } from "@/services/sessionService";
import { useSessionMonitor } from "./useSessionMonitor";
import { createSessionInterceptor } from "@/utils/sessionInterceptor";

export const useSessionManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { handleSessionInvalid } = useSessionMonitor();

  // Create session interceptor
  const sessionInterceptor = createSessionInterceptor(handleSessionInvalid);

  const initializeSession = async () => {
    try {
      console.log("Initializing session");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        // Create a new session if none exists
        await createNewSession(session.user.id);
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
    initializeSession,
    sessionInterceptor
  };
};