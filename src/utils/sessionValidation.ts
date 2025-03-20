
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
      navigate('/login', { replace: true });
      return false;
    }

    if (!session) {
      console.log("No active session found");
      navigate('/login', { replace: true });
      return false;
    }

    // Validate the session token
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      console.log("No session token found, creating new session");
      try {
        // Create a new session for this user if none exists
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (sessionData) {
          console.log("Found existing active session, using it");
          localStorage.setItem('session_token', sessionData.session_token);
        } else {
          // Import dynamically to avoid circular dependencies
          const { createNewSession } = await import('@/services/sessionService');
          await createNewSession(session.user.id);
        }
      } catch (error) {
        console.error("Error handling session token:", error);
      }
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
      if (navigate) {
        await handleSessionInvalidation(navigate, toast);
      }
      return false;
    }
    
    if (!sessionValid) {
      console.log("Session token invalid");
      if (navigate) {
        await handleSessionInvalidation(navigate, toast);
      }
      return false;
    }

    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log("No user found or error:", userError);
      if (navigate) {
        await handleSessionInvalidation(navigate, toast);
      }
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

export const checkActiveSession = async (userId: string, sessionToken: string): Promise<boolean> => {
  try {
    console.log('Checking active session for user:', userId);
    
    // Check if the session token exists and is valid
    const { data: isValid } = await supabase
      .rpc('is_session_valid', {
        p_session_token: sessionToken
      });

    if (!isValid) {
      console.log('Session token invalid or expired');
      return false;
    }

    // Check for other active sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('session_token, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('session_token', sessionToken);

    if (sessionsError) {
      console.error('Error checking active sessions:', sessionsError);
      return false;
    }

    // If there are other active sessions, this session is invalid
    if (sessions && sessions.length > 0) {
      console.log('Other active sessions found');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in checkActiveSession:', error);
    return false;
  }
};

const handleSessionInvalidation = async (navigate: NavigateFunction, toast: typeof toastFunction) => {
  console.log("Invalidating session and logging out user");
  try {
    // Clear all local storage and cookies
    localStorage.removeItem('session_token');
    localStorage.removeItem('supabase.refresh-token');
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Only show toast if it exists
    if (toast) {
      toast({
        title: "Session Ended",
        description: "Please sign in again to continue."
      });
    }
    
    // Redirect to login
    if (navigate) {
      navigate('/login', { replace: true });
    }
  } catch (error) {
    console.error("Error in handleSessionInvalidation:", error);
    if (navigate) {
      navigate('/login', { replace: true });
    }
  }
};
