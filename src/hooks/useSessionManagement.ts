import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createSessionInterceptor } from "@/utils/sessionInterceptor";

export const useSessionManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const handleSessionInvalidation = async (message: string) => {
    console.log('Handling session invalidation:', message);
    
    // Clear all local storage except refresh token
    const refreshToken = localStorage.getItem('supabase.refresh-token');
    localStorage.clear();
    if (refreshToken) {
      localStorage.setItem('supabase.refresh-token', refreshToken);
    }
    
    try {
      await supabase.auth.signOut();
      toast({
        variant: "default",
        title: "Session Ended",
        description: message
      });
    } catch (error) {
      console.error('Error during forced signout:', error);
    }
    
    navigate('/login', { replace: true });
  };

  const createNewSession = async (userId: string) => {
    try {
      console.log('Creating new session for user:', userId);
      
      // First invalidate any existing sessions
      const { error: invalidateError } = await supabase
        .rpc('invalidate_other_sessions', {
          p_user_id: userId,
          p_current_session_token: localStorage.getItem('session_token') || ''
        });

      if (invalidateError) {
        console.error('Error invalidating existing sessions:', invalidateError);
        throw invalidateError;
      }

      // Create new session token
      const sessionToken = crypto.randomUUID();

      // Get device info
      const { data: deviceInfo } = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json());

      // Create new session
      const { data: session, error: createError } = await supabase
        .from('sessions')
        .insert([{
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo,
          ip_address: deviceInfo?.ip,
          status: 'active'
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating new session:', createError);
        throw createError;
      }

      // Store session token
      localStorage.setItem('session_token', sessionToken);
      
      // Ensure refresh token is stored in both localStorage and secure cookie
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.refresh_token) {
        localStorage.setItem('supabase.refresh-token', authSession.refresh_token);
        document.cookie = `sb-refresh-token=${authSession.refresh_token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`; // 7 days
      }

      console.log('New session created successfully:', session);
      return session;
    } catch (error) {
      console.error('Error in createNewSession:', error);
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Failed to create new session. Please try again."
      });
      throw error;
    }
  };

  const initializeSession = async () => {
    try {
      console.log("Initializing session");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
        navigate('/login');
        return;
      }
      
      if (!session) {
        console.log("No active session found");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Ensure refresh token is properly stored
      if (session.refresh_token) {
        localStorage.setItem('supabase.refresh-token', session.refresh_token);
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
      }

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        // Create a new session if none exists
        await createNewSession(session.user.id);
      } else {
        // Validate existing session
        const { data: isValid } = await supabase
          .rpc('is_session_valid', {
            p_session_token: sessionToken
          });

        if (!isValid) {
          console.log('Session token invalid, creating new session');
          await createNewSession(session.user.id);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing session:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
      navigate('/login');
    }
  };

  // Create session interceptor
  const sessionInterceptor = createSessionInterceptor(() => {
    handleSessionInvalidation("Your session has expired. Please log in again.");
  });

  return {
    isLoading,
    initializeSession,
    sessionInterceptor,
    createNewSession
  };
};