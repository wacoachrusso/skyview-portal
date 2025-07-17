import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";
import { useSessionStore } from "@/stores/session";

export const handleSessionInvalidation = async (navigate: NavigateFunction, toast: typeof toastFunction) => {
  console.log("Invalidating session and logging out user");
  
  const { apiCallInProgress, clearSession, clearAllFlags } = useSessionStore.getState();
  
  // CRITICAL: Absolutely never invalidate during API calls
  if (apiCallInProgress) {
    console.log("API call in progress, BLOCKING session invalidation");
    return;
  }
  
  // Clear all session data from Zustand store
  clearSession();
  clearAllFlags();
  
  // Clear cookies
  document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Only show toast if it exists
  if (toast) {
    toast({
      title: "Session Ended",
      description: "Please sign in again to continue."
    });
  }
  
  // Redirect to login
  if (navigate) {
    navigate('/login', { replace: true });
  }
};