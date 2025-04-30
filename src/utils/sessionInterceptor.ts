import { supabase } from "@/integrations/supabase/client";

// Track ongoing refresh attempts to prevent duplicate refreshes
let isRefreshInProgress = false;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

export const createSessionInterceptor = (onSessionInvalidated: (message: string) => void) => {
  
  /**
   * Safely attempts to refresh the authentication token
   * @returns True if refresh was successful, false otherwise
   */
  const attemptTokenRefresh = async (): Promise<boolean> => {
    // Check if another refresh is in progress or if we're in cooldown period
    const now = Date.now();
    if (isRefreshInProgress || (now - lastRefreshTime < REFRESH_COOLDOWN)) {
      console.log("Token refresh already in progress or in cooldown period");
      return false;
    }

    try {
      isRefreshInProgress = true;
      console.log("Attempting to refresh authentication token");
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Failed to refresh token:", error);
        return false;
      }
      
      if (!data.session) {
        console.log("No session returned from refresh attempt");
        return false;
      }
      
      console.log("Successfully refreshed authentication token");
      return true;
    } catch (err) {
      console.error("Error during token refresh:", err);
      return false;
    } finally {
      isRefreshInProgress = false;
      lastRefreshTime = Date.now();
    }
  };

  /**
   * Intercepts a fetch response to handle auth-related errors
   */
  const handleResponseInterception = async (response: Response): Promise<Response> => {
    if (response.status === 401) {
      console.log("Received 401 response, attempting token refresh");
      
      const refreshSuccessful = await attemptTokenRefresh();
      
      if (!refreshSuccessful) {
        console.log("Token refresh failed or not possible, invalidating session");
        onSessionInvalidated("Your session has expired. Please log in again.");
      } else {
        console.log("Token refreshed successfully, original request should be retried by the caller");
      }
    }
    
    return response;
  };

  /**
   * Checks if current session is valid and refreshes if needed
   * Can be called proactively before making important API calls
   * @returns True if session is valid (possibly after refresh), false otherwise
   */
  const validateSession = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("No active session found");
        return false;
      }
      
      // Check if token is close to expiry (within 5 minutes)
      const expiresAt = data.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutesInSeconds = 5 * 60;
      
      if (expiresAt && (expiresAt - now < fiveMinutesInSeconds)) {
        console.log("Token close to expiry, refreshing preemptively");
        return await attemptTokenRefresh();
      }
      
      return true;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  };

  // Return the public API
  return {
    handleResponseInterception,
    validateSession,
    attemptTokenRefresh
  };
};