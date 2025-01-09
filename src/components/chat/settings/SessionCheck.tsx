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
      console.log("Setting up auth and checking session...");
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found");
        navigate('/login');
        return;
      }

      // Check profile and trial status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, query_count')
        .eq('id', session.user.id)
        .single();

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
      const { data: sessionValid } = await supabase
        .rpc('is_session_valid', {
          p_session_token: currentToken
        });

      if (!sessionValid) {
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