import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionState } from "@/hooks/useSessionState";
import { useAuthStateHandler } from "@/hooks/useAuthStateHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function SessionCheck() {
  const { checkCurrentSession } = useSessionState();
  const { handleAuthStateChange } = useAuthStateHandler();
  const { initializeSession } = useSessionManagement();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log("Setting up auth and checking session...");
        
        // First clear any existing session data to ensure clean state
        localStorage.removeItem('supabase.auth.token');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found");
          navigate('/login');
          return;
        }

        // Refresh the session to ensure we have valid tokens
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          throw refreshError;
        }

        // Check profile and trial status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          throw profileError;
        }

        if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
          console.log('Free trial exhausted, logging out');
          await supabase.auth.signOut();
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        const currentToken = localStorage.getItem('session_token');
        
        // Verify session is still valid
        if (currentToken) {
          const { data: sessionValid, error: validationError } = await supabase
            .rpc('is_session_valid', {
              p_session_token: currentToken
            });

          if (validationError || !sessionValid) {
            console.log("Session invalid or superseded by another device");
            throw new Error("Invalid session");
          }
        }

        // Set up periodic session validation
        const validationInterval = setInterval(async () => {
          try {
            const token = localStorage.getItem('session_token');
            if (!token) {
              throw new Error("No session token found");
            }

            const { data: stillValid, error: validationError } = await supabase
              .rpc('is_session_valid', {
                p_session_token: token
              });

            if (validationError || !stillValid) {
              throw new Error("Session invalidated");
            }
          } catch (error) {
            console.error("Session validation failed:", error);
            clearInterval(validationInterval);
            await handleSessionError();
          }
        }, 30000); // Check every 30 seconds

        await checkCurrentSession();
        await initializeSession();

        return () => clearInterval(validationInterval);

      } catch (error) {
        console.error("Error in auth setup:", error);
        await handleSessionError();
      }
    };

    const handleSessionError = async () => {
      console.log("Handling session error, cleaning up...");
      localStorage.clear();
      await supabase.auth.signOut();
      toast({
        title: "Session Ended",
        description: "Your session has expired. Please sign in again."
      });
      navigate('/login');
    };

    setupAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [checkCurrentSession, handleAuthStateChange, initializeSession, navigate, toast]);

  return null;
}