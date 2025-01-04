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
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
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

      await checkCurrentSession();
      await initializeSession();
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