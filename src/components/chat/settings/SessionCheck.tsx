import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionState } from "@/hooks/useSessionState";
import { useAuthStateHandler } from "@/hooks/useAuthStateHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useSessionValidation } from "@/hooks/session/useSessionValidation";
import { useTrialCheck } from "@/hooks/session/useTrialCheck";
import { usePeriodicValidation } from "@/hooks/session/usePeriodicValidation";

export function SessionCheck() {
  const { checkCurrentSession } = useSessionState();
  const { handleAuthStateChange } = useAuthStateHandler();
  const { initializeSession } = useSessionManagement();
  const { validateSession } = useSessionValidation();
  const { checkTrialStatus } = useTrialCheck();
  const { startPeriodicValidation } = usePeriodicValidation();

  useEffect(() => {
    const setupAuth = async () => {
      console.log("Setting up auth and checking session...");
      
      // Initial session validation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Validate current session
      const isValid = await validateSession();
      if (!isValid) return;

      // Check trial status
      const trialValid = await checkTrialStatus(session.user.id);
      if (!trialValid) return;

      // Initialize session and start periodic validation
      await checkCurrentSession();
      await initializeSession();
      startPeriodicValidation();
    };

    setupAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [checkCurrentSession, handleAuthStateChange, initializeSession]);

  return null;
}