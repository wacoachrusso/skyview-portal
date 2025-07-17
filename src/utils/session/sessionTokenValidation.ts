import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";
import { handleSessionInvalidation } from "./sessionInvalidation";
import { updateSessionApiActivity } from "@/services/session/validateSession";
import { useSessionStore } from "@/stores/session";

interface ValidationProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const validateSessionToken = async (currentToken: string | null, { navigate, toast }: ValidationProps = {} as ValidationProps): Promise<boolean> => {
  if (!currentToken) return false;

  try {
    const { apiCallInProgress } = useSessionStore.getState();
    
    // Critical: ALWAYS skip full validation during API calls
    if (apiCallInProgress) {
      console.log("API call in progress, skipping ALL session validation checks");
      // Just update the timestamp without any validation
      try {
        await updateSessionApiActivity(currentToken);
      } catch (error) {
        console.warn("Non-critical error updating session activity:", error);
      }
      return true;
    }

    // First check if the current session token is valid
    const { data: sessionValid, error: validationError } = await supabase
      .rpc('is_session_valid', {
        p_session_token: currentToken
      });

    if (validationError) {
      console.error("Error validating session:", validationError);
      if (navigate) {
        await handleSessionInvalidation(navigate, toast);
      }
      return false;
    }
    
    if (!sessionValid) {
      console.log("Session token invalid");
      if (navigate) {
        await handleSessionInvalidation(navigate, toast);
      }
      return false;
    }

    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log("No user found or error:", userError);
      if (navigate) {
        await handleSessionInvalidation(navigate, toast);
      }
      return false;
    }

    // Update the last activity timestamp for the session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', currentToken)
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Error updating session activity:", updateError);
    }

    return true;
  } catch (error) {
    console.error("Error validating session token:", error);
    return false;
  }
};

export const checkActiveSession = async (userId: string, sessionToken: string): Promise<boolean> => {
  try {
    console.log('Checking active session for user:', userId);
    
    const { apiCallInProgress } = useSessionStore.getState();
    
    // ALWAYS skip ALL session checks during API calls
    if (apiCallInProgress) {
      console.log("API call in progress, skipping ALL session checks");
      return true;
    }
    
    // Check if the session token exists and is valid
    const { data: isValid } = await supabase
      .rpc('is_session_valid', {
        p_session_token: sessionToken
      });

    if (!isValid) {
      console.log('Session token invalid or expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in checkActiveSession:', error);
    return false;
  }
};