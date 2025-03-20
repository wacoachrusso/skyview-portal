
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

export const handleSessionInvalidation = async (navigate: NavigateFunction, toast: typeof toastFunction) => {
  console.log("Invalidating session and logging out user");
  
  // CRITICAL: Absolutely never invalidate during API calls
  if (sessionStorage.getItem('api_call_in_progress') === 'true') {
    console.log("API call in progress, BLOCKING session invalidation");
    return;
  }
  
  // Clear all local storage and cookies
  localStorage.removeItem('session_token');
  localStorage.removeItem('supabase.refresh-token');
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
