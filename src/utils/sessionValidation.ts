
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
      return false;
    }

    if (!session) {
      console.log("No active session found");
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
      return false;
    }

    // Check if free trial is exhausted
    if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
      console.log('Free trial exhausted');
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

export const validateSessionToken = async (currentToken: string | null, { navigate, toast }: ValidationProps = {} as ValidationProps): Promise<boolean> => {
  if (!currentToken) return false;

  try {
    // First check if the current session token is valid
    const { data: sessionValid, error: validationError } = await supabase
      .rpc('is_session_valid', {
        p_session_token: currentToken
      });

    if (validationError) {
      console.error("Error validating session:", validationError);
      return false;
    }
    
    if (!sessionValid) {
      console.log("Session token invalid");
      return false;
    }

    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log("No user found or error:", userError);
      return false;
    }

    // Update the last activity timestamp for the session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', currentToken)
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Error updating session activity:", updateError);
    }

    return true;
  } catch (error) {
    console.error("Error validating session token:", error);
    return false;
  }
};

// Helper function to handle session invalidation
export const handleSessionInvalidation = async (navigate: NavigateFunction, toast: typeof toastFunction) => {
  console.log("Handling session invalidation");
  try {
    // Clear session tokens
    localStorage.removeItem('session_token');
    
    // Clear all Supabase tokens
    await supabase.auth.signOut({ scope: 'local' });
    
    // Show toast notification if available
    if (toast) {
      toast({
        title: "Session Ended",
        description: "Your session has expired. Please sign in again."
      });
    }
    
    // Redirect to login
    if (navigate) {
      navigate('/login', { replace: true });
    }
  } catch (error) {
    console.error("Error in handleSessionInvalidation:", error);
  }
};
