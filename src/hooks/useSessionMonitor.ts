import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkActiveSession } from "@/utils/sessionValidation";
import { refreshSession, updateSessionActivity } from "@/services/sessionService";

export const useSessionMonitor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const monitorSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentToken = localStorage.getItem('session_token');
      if (!currentToken) {
        handleSessionInvalid("No session token found");
        return;
      }

      // Subscribe to session invalidation events
      const subscription = supabase
        .channel('session-invalidation')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sessions',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            if (payload.new.status === 'invalidated' && 
                payload.new.session_token === currentToken) {
              console.log('Session invalidated by another login');
              handleSessionInvalid("Your session was terminated because you logged in on another device");
            }
          }
        )
        .subscribe();

      // Set up periodic session validation
      const validationInterval = setInterval(async () => {
        const isValid = await checkActiveSession(session.user.id, currentToken);
        if (!isValid) {
          const refreshed = await refreshSession();
          if (!refreshed) {
            handleSessionInvalid("Your session has expired");
            clearInterval(validationInterval);
          } else {
            await updateSessionActivity(currentToken);
          }
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => {
        subscription.unsubscribe();
        clearInterval(validationInterval);
      };
    };

    monitorSession();
  }, [navigate, toast]);

  const handleSessionInvalid = async (message: string) => {
    console.log('Session invalid:', message);
    localStorage.clear();
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Session Ended",
      description: message
    });
    navigate('/login');
  };

  return { handleSessionInvalid };
};