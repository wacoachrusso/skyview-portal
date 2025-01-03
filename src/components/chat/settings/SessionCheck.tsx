import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export function SessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession, invalidateOtherSessions } = useSessionManagement();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session in SessionCheck component...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found, redirecting to login");
          localStorage.clear();
          navigate('/login');
          return;
        }

        // Create a new session and invalidate others
        const newSession = await createNewSession(session.user.id);
        await invalidateOtherSessions(session.user.id, newSession.session_token);

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          await handleSessionError();
          return;
        }

        console.log("Valid session found for user:", user.email);
      } catch (error: any) {
        console.error("Unexpected error in session check:", error);
        await handleSessionError();
      }
    };

    const handleSessionError = async () => {
      console.log("Handling session error, cleaning up...");
      localStorage.clear();
      await supabase.auth.signOut();
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Your session has expired. Please log in again."
      });
      navigate('/login');
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in SessionCheck:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("New sign-in detected, creating session...");
        try {
          // When a new sign-in occurs, create a new session and invalidate others
          const newSession = await createNewSession(session.user.id);
          await invalidateOtherSessions(session.user.id, newSession.session_token);
          
          // Only attempt re-authentication for Google users
          if (session.user.app_metadata.provider === 'google') {
            console.log("Re-authenticating Google user...");
            const { error: reAuthError } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
                redirectTo: `${window.location.origin}/auth/callback`
              }
            });

            if (reAuthError) {
              console.error("Error re-authenticating:", reAuthError);
              await handleSessionError();
            }
          }
        } catch (error) {
          console.error("Error handling sign-in:", error);
          await handleSessionError();
        }
      }
    });

    return () => {
      console.log("Cleaning up session check...");
      subscription.unsubscribe();
    };
  }, [navigate, toast, createNewSession, invalidateOtherSessions]);

  return null;
}