import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSessionToken } from "@/utils/sessionValidation";

export const useSessionMonitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentToken = localStorage.getItem('session_token');
    if (!currentToken) return;

    const validationInterval = setInterval(async () => {
      const isValid = await validateSessionToken(currentToken, { navigate, toast });
      if (!isValid) {
        clearInterval(validationInterval);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(validationInterval);
  }, [navigate, toast]);
};