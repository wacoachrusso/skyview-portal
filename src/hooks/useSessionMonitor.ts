import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSessionMonitor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const monitorSession = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentToken = localStorage.getItem('session_token');
      if (!currentToken) return;

      // Subscribe to session changes
      const subscription = supabase
        .channel('session-invalidation')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sessions',
            filter: `session_token=eq.${currentToken}`
          },
          async (payload) => {
            if (payload.new.status === 'invalidated') {
              console.log('Session invalidated by another login');
              
              // Clear local storage and sign out
              localStorage.clear();
              await supabase.auth.signOut();
              
              // Inform user with toast
              toast({
                variant: "destructive",
                title: "Session Ended",
                description: "Your account was logged in from another device. For security reasons, you've been logged out."
              });
              
              // Redirect to login
              navigate('/login', { replace: true });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    monitorSession();
  }, [navigate, toast]);
};