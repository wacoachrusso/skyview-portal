
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

    // Initial validation to ensure the session is valid
    validateSessionToken(currentToken, { navigate, toast })
      .then(isValid => {
        if (!isValid) {
          console.log("Initial session validation failed");
          // Session is invalid, but this will be handled by validateSessionToken
        } else {
          console.log("Initial session validation passed");
        }
      })
      .catch(error => {
        console.error("Error during initial session validation:", error);
      });

    // Set a less frequent interval for checking to reduce unnecessary validations
    const validationInterval = setInterval(async () => {
      try {
        // Only validate if we're not on login/signup pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('/login') || currentPath.includes('/signup')) {
          console.log("On login/signup page, skipping session validation");
          return;
        }

        const isValid = await validateSessionToken(currentToken, { navigate, toast });
        if (!isValid) {
          console.log("Session became invalid, clearing interval");
          clearInterval(validationInterval);
        }
      } catch (error) {
        console.error("Error in session validation interval:", error);
      }
    }, 60000); // Check every minute instead of every 30 seconds

    return () => clearInterval(validationInterval);
  }, [navigate, toast]);
};
