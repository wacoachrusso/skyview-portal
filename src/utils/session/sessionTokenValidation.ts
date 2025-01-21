import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";
import { handleSessionInvalidation } from "./sessionInvalidation";

interface ValidationProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const validateSessionToken = async (currentToken: string | null, { navigate, toast }: ValidationProps) => {
  if (!currentToken) return false;

  try {
    // First check if the current session token is valid
    const { data: sessionValid, error: validationError } = await supabase
      .rpc('is_session_valid', {
        p_session_token: currentToken
      });

    if (validationError || !sessionValid) {
      console.log("Session invalid");
      await handleSessionInvalidation(navigate, toast);
      return false;
    }

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found");
      await handleSessionInvalidation(navigate, toast);
      return false;
    }

    // Check for other active sessions
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('session_token, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .neq('session_token', currentToken);

    if (sessionsError) {
      console.error("Error checking active sessions:", sessionsError);
      return false;
    }

    // If there are other active sessions, invalidate current session
    if (activeSessions && activeSessions.length > 0) {
      console.log("Other active sessions found, invalidating current session");
      await handleSessionInvalidation(navigate, toast);
      return false;
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
    
    // Check if the session token exists and is valid
    const { data: isValid } = await supabase
      .rpc('is_session_valid', {
        p_session_token: sessionToken
      });

    if (!isValid) {
      console.log('Session token invalid or expired');
      return false;
    }

    // Check for other active sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('session_token, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('session_token', sessionToken);

    if (sessionsError) {
      console.error('Error checking active sessions:', sessionsError);
      return false;
    }

    // If there are other active sessions, this session is invalid
    if (sessions && sessions.length > 0) {
      console.log('Other active sessions found');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in checkActiveSession:', error);
    return false;
  }
};