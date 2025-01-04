import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionState } from "@/hooks/useSessionState";
import { useAuthStateHandler } from "@/hooks/useAuthStateHandler";

export function SessionCheck() {
  const { checkCurrentSession } = useSessionState();
  const { handleAuthStateChange } = useAuthStateHandler();

  useEffect(() => {
    checkCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      console.log("Cleaning up session check...");
      subscription.unsubscribe();
    };
  }, []);

  return null;
}