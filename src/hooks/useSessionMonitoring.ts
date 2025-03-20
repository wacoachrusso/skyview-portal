
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { validateSessionToken } from "@/utils/sessionValidation";

export const useSessionMonitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentToken = localStorage.getItem('session_token');
    if (!currentToken) return;

    console.log("Setting up session monitoring");
    let isMonitoringActive = true;

    // Set up interval to validate session with a more reasonable timing
    const validationInterval = setInterval(async () => {
      // Skip validation if API call is in progress or navigation is happening
      if (sessionStorage.getItem('api_call_in_progress') === 'true' || !isMonitoringActive) {
        console.log("Skipping session validation - operation in progress");
        return;
      }
      
      try {
        const isValid = await validateSessionToken(currentToken, { navigate, toast });
        if (!isValid) {
          console.log("Session is no longer valid, clearing interval");
          clearInterval(validationInterval);
        }
      } catch (error) {
        console.error("Error in session validation:", error);
      }
    }, 60000); // Check every minute instead of 30 seconds

    // Set up a listener for beforeunload to clean up API call flag
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('api_call_in_progress');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log("Cleaning up session monitoring");
      isMonitoringActive = false;
      clearInterval(validationInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, toast]);
};
