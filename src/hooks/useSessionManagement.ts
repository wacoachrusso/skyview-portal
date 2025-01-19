import { useSessionInitialization } from "./session/useSessionInitialization";
import { useSessionInvalidation } from "./session/useSessionInvalidation";
import { useSessionInterceptor } from "./session/useSessionInterceptor";
import { supabase } from "@/integrations/supabase/client";

export const createNewSession = async (userId: string) => {
  console.log('Creating new session for user:', userId);
  
  try {
    // First invalidate any existing sessions
    const { error: invalidateError } = await supabase
      .rpc('invalidate_other_sessions', {
        p_user_id: userId,
        p_current_session_token: ''
      });

    if (invalidateError) {
      console.error('Error invalidating other sessions:', invalidateError);
    }

    // Generate new session token
    const sessionToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();

    // Get device info
    const { data: deviceInfo } = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json());

    // Create new session
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

    // Store session tokens
    localStorage.setItem('session_token', sessionToken);
    localStorage.setItem('supabase.refresh-token', refreshToken);
    
    console.log('New session created successfully');
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const useSessionManagement = () => {
  const { isLoading, initializeSession } = useSessionInitialization();
  const { handleSessionInvalidation } = useSessionInvalidation();
  const { sessionInterceptor } = useSessionInterceptor();

  return {
    isLoading,
    initializeSession,
    sessionInterceptor,
    createNewSession,
    handleSessionInvalidation
  };
};