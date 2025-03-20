
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";
import { validateSessionToken } from "./sessionTokenValidation";


interface ValidationProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const validateCurrentSession = async ({ navigate, toast }: ValidationProps) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      navigate('/login');
      return false;
    }

    if (!session) {
      console.log("No active session found");
      navigate('/login');
      return false;
    }

    return session;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
};

export { validateSessionToken };
