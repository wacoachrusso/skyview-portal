
import { supabase } from "@/integrations/supabase/client";

export const createNewSession = async (userId: string) => {
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
    }

    // Create new session token
    const sessionToken = crypto.randomUUID();

    // Get device info
    const { data: deviceInfo } = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .catch(() => ({ ip: 'unknown' }));

    // Create new session
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo || {},
        ip_address: deviceInfo?.ip || 'unknown',
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

    console.log('New session created successfully');
    return session;
  } catch (error) {
    console.error('Error in createNewSession:', error);
    throw error;
  }
};

export const validateSessionToken = async (sessionToken: string) => {
  try {
    if (!sessionToken) return false;

    const { data: isValid, error } = await supabase
      .rpc('is_session_valid', {
        p_session_token: sessionToken
      });

    if (error) {
      console.error('Error validating session token:', error);
      return false;
    }

    return isValid;
  } catch (error) {
    console.error('Error in validateSessionToken:', error);
    return false;
  }
};

export const updateSessionActivity = async (sessionToken: string) => {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken);

    if (error) {
      console.error('Error updating session activity:', error);
    }
  } catch (error) {
    console.error('Error in updateSessionActivity:', error);
  }
};
