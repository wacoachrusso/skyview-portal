import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";
import { toast as toastFunction } from "@/hooks/use-toast";

interface ValidationProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const validateCurrentSession = async ({ navigate, toast }: ValidationProps) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      navigate('/login');
      return false;
    }

    if (!session) {
      console.log("No active session found");
      navigate('/login');
      return false;
    }

    return session;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
};

export const checkProfileStatus = async (userId: string, { navigate, toast }: ValidationProps) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, query_count')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      await supabase.auth.signOut();
      navigate('/login');
      return false;
    }

    if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
      console.log('Free trial exhausted, logging out');
      await supabase.auth.signOut();
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue."
      });
      navigate('/?scrollTo=pricing-section');
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking profile:", error);
    return false;
  }
};

export const validateSessionToken = async (currentToken: string | null, { navigate, toast }: ValidationProps) => {
  if (!currentToken) return false;

  try {
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
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating session token:", error);
    return false;
  }
};