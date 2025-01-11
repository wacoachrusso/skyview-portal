import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSessionValidation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateSession = async () => {
    console.log("Validating current session...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session found");
      navigate('/login');
      return false;
    }

    const currentToken = localStorage.getItem('session_token');
    if (!currentToken) {
      console.log("No session token found");
      await handleInvalidSession("Session token not found");
      return false;
    }

    const { data: sessionValid } = await supabase
      .rpc('is_session_valid', {
        p_session_token: currentToken
      });

    if (!sessionValid) {
      console.log("Session invalid or expired");
      await handleInvalidSession("Your session has expired");
      return false;
    }

    return true;
  };

  const handleInvalidSession = async (message: string) => {
    console.log("Handling invalid session:", message);
    localStorage.clear();
    await supabase.auth.signOut();
    toast({
      title: "Session Ended",
      description: message
    });
    navigate('/login');
  };

  return { validateSession, handleInvalidSession };
};