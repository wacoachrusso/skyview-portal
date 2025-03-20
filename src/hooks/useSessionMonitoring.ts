
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

    // Set up interval to validate session with a more reasonable timing (5 minutes)
    const validationInterval = setInterval(async () => {
      // Always skip validation if API call is in progress
      if (sessionStorage.getItem('api_call_in_progress') === 'true' || !isMonitoringActive) {
        console.log("Skipping session monitoring - operation in progress");
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
        // Don't invalidate session on validation errors
      }
    }, 300000); // Check every 5 minutes instead of 2 minutes

    // Set up a listener for beforeunload to clean up API call flag
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('api_call_in_progress');
      sessionStorage.removeItem('api_call_id');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up page transition listener to reset API call flag when navigating
    const handlePageTransition = () => {
      // Give a short delay to complete any navigation
      setTimeout(() => {
        const apiCallId = sessionStorage.getItem('api_call_id');
        if (apiCallId) {
          console.log(`Navigation detected, clearing any stuck API call with ID ${apiCallId}`);
          sessionStorage.removeItem('api_call_in_progress');
          sessionStorage.removeItem('api_call_id');
        }
      }, 200);
    };
    
    // Use intersection observer as a proxy for page transitions
    const observer = new IntersectionObserver(handlePageTransition, { threshold: 0.1 });
    const body = document.querySelector('body');
    if (body) observer.observe(body);
    
    // Set up visibility change listener to reset API call flag if page is hidden/shown
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When page becomes visible again, check if an API call has been stuck
        const apiCallId = sessionStorage.getItem('api_call_id');
        if (apiCallId) {
          console.log(`Detected potentially stuck API call with ID ${apiCallId}, clearing flag`);
          sessionStorage.removeItem('api_call_in_progress');
          sessionStorage.removeItem('api_call_id');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log("Cleaning up session monitoring");
      isMonitoringActive = false;
      clearInterval(validationInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (body) observer.disconnect();
    };
  }, [navigate, toast]);
};
