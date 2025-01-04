import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createSessionInterceptor } from "@/utils/sessionInterceptor";

export const useSessionManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const createNewSession = async (userId: string) => {
    try {
      console.log('Creating new session for user:', userId);
      
      // First invalidate any existing sessions
      const { error: invalidateError } = await supabase
        .from('sessions')
        .update({ 
          status: 'invalidated',
          invalidated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (invalidateError) {
        console.error('Error invalidating existing sessions:', invalidateError);
        throw invalidateError;
      }

      // Create new session token
      const sessionToken = crypto.randomUUID();
      const refreshToken = crypto.randomUUID();

      // Get device info
      const { data: deviceInfo } = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json());

      // Create new session
      const { data: session, error: createError } = await supabase
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

      if (createError) {
        console.error('Error creating new session:', createError);
        throw createError;
      }

      // Store session token
      localStorage.setItem('session_token', sessionToken);
      
      // Set refresh token in secure cookie
      document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`; // 7 days

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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Get current session token
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        // Create a new session if none exists
        await createNewSession(session.user.id);
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
    console.log("Session invalid, redirecting to login");
    localStorage.clear();
    navigate('/login');
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again."
    });
  });

  return {
    isLoading,
    initializeSession,
    sessionInterceptor,
    createNewSession
  };
};