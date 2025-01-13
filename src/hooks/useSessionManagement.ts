import { useSessionInitialization } from "./session/useSessionInitialization";
import { useSessionInvalidation } from "./session/useSessionInvalidation";
import { useSessionInterceptor } from "./session/useSessionInterceptor";
import { createNewSession } from "./session/useSessionCreation";
import { supabase } from "@/integrations/supabase/client";

export const useSessionManagement = () => {
  const { isLoading, initializeSession } = useSessionInitialization();
  const { handleSessionInvalidation } = useSessionInvalidation();
  const { sessionInterceptor } = useSessionInterceptor();

  const validateSession = async (sessionToken: string) => {
    try {
      const { data: isValid } = await supabase
        .rpc('is_session_valid', {
          p_session_token: sessionToken
        });

      if (!isValid) {
        // Clear sensitive data
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('session_token');
        document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const refreshToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-refresh-token='))
        ?.split('=')[1];

      if (!refreshToken) {
        return false;
      }

      const { data, error } = await supabase
        .rpc('refresh_session', {
          p_refresh_token: refreshToken
        });

      if (error || !data?.[0]) {
        return false;
      }

      const { session_token } = data[0];
      localStorage.setItem('session_token', session_token);
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  return {
    isLoading,
    initializeSession,
    sessionInterceptor,
    createNewSession,
    handleSessionInvalidation,
    validateSession,
    refreshSession
  };
};