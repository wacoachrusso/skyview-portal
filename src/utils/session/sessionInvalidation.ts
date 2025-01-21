import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

export const handleSessionInvalidation = async (navigate: NavigateFunction, toast: typeof toastFunction) => {
  console.log("Invalidating session and logging out user");
  localStorage.clear();
  await supabase.auth.signOut();
  toast({
    title: "Session Ended",
    description: "Your account has been signed in on another device."
  });
  navigate('/login');
};