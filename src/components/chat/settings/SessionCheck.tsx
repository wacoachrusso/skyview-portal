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
        
        // Clear any existing session first
        localStorage.removeItem('session_token');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate('/login');
          return;
        }

        if (!session) {
          console.log("No active session found");
          navigate('/login');
          return;
        }

        // Attempt to refresh the session
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession.session) {
          console.error("Session refresh failed:", refreshError);
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        // Check profile and trial status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          await supabase.auth.signOut();
          navigate('/login');
          return;
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
        const { data: sessionValid, error: validationError } = await supabase
          .rpc('is_session_valid', {
            p_session_token: currentToken
          });

        if (validationError || !sessionValid) {
          console.log("Session invalid or superseded by another device");
          localStorage.clear();
          await supabase.auth.signOut();
          toast({
            title: "Session Ended",
            description: "Your account has been signed in on another device."
          });
          navigate('/login');
          return;
        }

        // Set up periodic session validation
        const validationInterval = setInterval(async () => {
          const { data: stillValid } = await supabase
            .rpc('is_session_valid', {
              p_session_token: localStorage.getItem('session_token')
            });

          if (!stillValid) {
            console.log("Session invalidated by another login");
            clearInterval(validationInterval);
            localStorage.clear();
            await supabase.auth.signOut();
            toast({
              title: "Session Ended",
              description: "Your account has been signed in on another device."
            });
            navigate('/login');
          }
        }, 30000); // Check every 30 seconds

        await checkCurrentSession();
        await initializeSession();

        return () => clearInterval(validationInterval);
      } catch (error) {
        console.error("Unexpected error in setupAuth:", error);
        localStorage.clear();
        await supabase.auth.signOut();
        navigate('/login');
      }
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