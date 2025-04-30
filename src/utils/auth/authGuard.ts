// src/utils/auth/authGuard.ts
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

/**
 * Check if the user is authenticated
 * @returns boolean indicating if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  // First check if we're in an auth stabilization period
  const authStabilizing = localStorage.getItem("auth_stabilizing") === "true";
  if (authStabilizing) {
    // During stabilization periods, don't make quick authentication decisions
    console.log("Auth stabilizing, assuming authenticated");
    return true;
  }
  
  // Check for payment in progress
  const paymentInProgress = localStorage.getItem("payment_in_progress") === "true";
  if (paymentInProgress) {
    console.log("Payment in progress, assuming authenticated");
    return true;
  }
  
  // Check localStorage for cached authentication state (helps during page reload)
  const accessToken = localStorage.getItem("sb-access-token") || 
                      localStorage.getItem("auth_access_token");
  
  if (accessToken) {
    return true;
  }
  
  // If we can detect a session from the cookies, that's also a sign we're authenticated
  const hasSessionCookies = document.cookie.includes("sb-access-token") || 
                          document.cookie.includes("sb-refresh-token");
  
  if (hasSessionCookies) {
    return true;
  }
  
  // Final check for Supabase's localStorage session
  try {
    const storedSession = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_PROJECT_ID + '-auth-token');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      if (sessionData?.access_token) {
        return true;
      }
    }
  } catch (error) {
    console.error("Error parsing stored session:", error);
  }
  
  return false;
};

/**
 * Redirect if the user is not authenticated
 * @param navigate - The React Router navigate function
 * @returns boolean indicating if a redirect occurred
 */
export const redirectIfUnauthenticated = (navigate: NavigateFunction): boolean => {
  if (!isAuthenticated()) {
    // Save the current location for post-login redirect
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem("auth_redirect_path", currentPath);
    
    console.log("Redirecting unauthenticated user to login");
    navigate("/login", { replace: true });
    return true;
  }
  return false;
};

/**
 * Redirect if the user is authenticated
 * @param navigate - The React Router navigate function
 * @returns boolean indicating if a redirect occurred
 */
export const redirectIfAuthenticated = (navigate: NavigateFunction): boolean => {
  if (isAuthenticated()) {
    // Prefer any saved redirect path
    const redirectPath = localStorage.getItem("auth_redirect_path") || "/chat";
    localStorage.removeItem("auth_redirect_path");
    
    console.log("Redirecting authenticated user to:", redirectPath);
    navigate(redirectPath, { replace: true });
    return true;
  }
  return false;
};

/**
 * Force refresh the authentication token
 */
export const refreshAuthToken = async (): Promise<void> => {
  try {
    localStorage.setItem("auth_refresh_in_progress", "true");
    const { error } = await supabase.auth.refreshSession();
    if (error) throw error;
    console.log("Auth token refreshed successfully");
  } catch (error) {
    console.error("Failed to refresh auth token:", error);
    // If refresh fails, sign out to get a clean state
    await supabase.auth.signOut();
  } finally {
    localStorage.removeItem("auth_refresh_in_progress");
  }
};