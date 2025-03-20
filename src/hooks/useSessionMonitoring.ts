
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSessionToken } from "@/utils/sessionValidation";

export const useSessionMonitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentToken = localStorage.getItem('session_token');
    if (!currentToken) return;

    // Set up interval to validate session
    const validationInterval = setInterval(async () => {
      // Skip validation if API call is in progress
      if (sessionStorage.getItem('api_call_in_progress') === 'true') {
        console.log("API call in progress, skipping session validation");
        return;
      }
      
      const isValid = await validateSessionToken(currentToken, { navigate, toast });
      if (!isValid) {
        clearInterval(validationInterval);
      }
    }, 30000); // Check every 30 seconds

    // Set up a listener for beforeunload to clean up API call flag
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('api_call_in_progress');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(validationInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, toast]);
};
