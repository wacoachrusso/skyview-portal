import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSessionManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const createNewSession = async (userId: string) => {
    console.log('Creating new session for user:', userId);
    
    try {
      const sessionToken = crypto.randomUUID();
      const refreshToken = crypto.randomUUID();
      const { data: deviceInfo } = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json());

      // First invalidate any existing active sessions
      await invalidateAllUserSessions(userId);

      const { data: session, error } = await supabase
        .from('sessions')
        .insert([{
          user_id: userId,
          session_token: sessionToken,
          refresh_token: refreshToken,
          device_info: deviceInfo,
          ip_address: deviceInfo?.ip,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Store tokens securely
      localStorage.setItem('session_token', sessionToken);
      document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`; // 7 days

      console.log('New session created:', session);
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const invalidateAllUserSessions = async (userId: string) => {
    console.log('Invalidating all sessions for user:', userId);
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status: 'invalidated',
          invalidated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      console.log('All previous sessions invalidated');
    } catch (error) {
      console.error('Error invalidating sessions:', error);
      throw error;
    }
  };

  const validateSession = async (sessionToken: string): Promise<boolean> => {
    console.log('Validating session token');
    
    try {
      const { data: isValid, error } = await supabase
        .rpc('is_session_valid', {
          p_session_token: sessionToken
        });

      if (error) throw error;
      return isValid;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  };

  const refreshSession = async () => {
    console.log('Attempting to refresh session');
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refresh_token='))
      ?.split('=')[1];

    if (!refreshToken) {
      console.log('No refresh token found');
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('refresh_session', {
          p_refresh_token: refreshToken
        });

      if (error || !data?.[0]) {
        console.error('Error refreshing session:', error);
        return false;
      }

      const { session_token, expires_at } = data[0];
      localStorage.setItem('session_token', session_token);
      console.log('Session refreshed successfully, expires:', expires_at);
      return true;
    } catch (error) {
      console.error('Error in refresh session:', error);
      return false;
    }
  };

  const updateSessionActivity = async (sessionToken: string) => {
    console.log('Updating session activity');
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken);

      if (error) throw error;
      console.log('Session activity updated');
    } catch (error) {
      console.error('Error updating session activity:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session validity");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "There was a problem with your session. Please log in again."
          });
          navigate('/login');
          return;
        }

        if (!session) {
          console.log("No active session found");
          setIsLoading(false);
          navigate('/login');
          return;
        }

        // Get current session token
        const sessionToken = localStorage.getItem('session_token');
        if (!sessionToken) {
          // Try to create a new session
          await createNewSession(session.user.id);
        } else {
          // Validate existing session
          const isValid = await validateSession(sessionToken);
          if (!isValid) {
            // Try to refresh the session
            const refreshed = await refreshSession();
            if (!refreshed) {
              console.log('Session expired and refresh failed');
              await supabase.auth.signOut();
              toast({
                variant: "destructive",
                title: "Session Expired",
                description: "Your session has expired. Please log in again."
              });
              navigate('/login');
              return;
            }
          }
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
              const currentToken = localStorage.getItem('session_token');
              if (payload.new.status === 'invalidated' && 
                  payload.new.session_token === currentToken) {
                console.log('Session invalidated by another login');
                toast({
                  variant: "destructive",
                  title: "Session Terminated",
                  description: "Your session has been terminated because you logged in from another device."
                });
                await supabase.auth.signOut();
                navigate('/login');
              }
            }
          )
          .subscribe();

        // Set up periodic session validation
        const validationInterval = setInterval(async () => {
          const currentToken = localStorage.getItem('session_token');
          if (currentToken) {
            const isValid = await validateSession(currentToken);
            if (!isValid) {
              const refreshed = await refreshSession();
              if (!refreshed) {
                clearInterval(validationInterval);
                await supabase.auth.signOut();
                toast({
                  variant: "destructive",
                  title: "Session Expired",
                  description: "Your session has expired. Please log in again."
                });
                navigate('/login');
              }
            } else {
              await updateSessionActivity(currentToken);
            }
          }
        }, 5 * 60 * 1000); // Check every 5 minutes

        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
          clearInterval(validationInterval);
        };
      } catch (error) {
        console.error("Unexpected error in checkSession:", error);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate, toast]);

  return {
    isLoading,
    createNewSession,
    validateSession,
    refreshSession,
    updateSessionActivity,
    invalidateAllUserSessions
  };
};