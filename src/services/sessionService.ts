
import { supabase } from "@/integrations/supabase/client";

export const createNewSession = async (userId: string): Promise<any> => {
  console.log('Creating new session for user:', userId);
  
  try {
    // First invalidate any existing sessions
    const { error: invalidateError } = await supabase
      .rpc('invalidate_other_sessions', {
        p_user_id: userId,
        p_current_session_token: localStorage.getItem('session_token') || ''
      });

    if (invalidateError) {
      console.error('Error invalidating existing sessions:', invalidateError);
      // Continue despite error, as this might be the first session
    }

    // Create new session token
    const sessionToken = crypto.randomUUID();

    // Get device info
    let deviceInfo: Record<string, string> = {};
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      deviceInfo = data as Record<string, string>;
    } catch (error) {
      console.warn('Could not fetch device info:', error);
      // Continue with minimal device info
      deviceInfo = { ip: 'unknown' };
    }

    // Create new session
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: deviceInfo.ip || 'unknown',
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

export const validateSessionToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    console.log('Validating session token');
    const { data: isValid, error } = await supabase
      .rpc('is_session_valid', {
        p_session_token: token
      });

    if (error) {
      console.error('Error validating session token:', error);
      return false;
    }

    if (isValid) {
      // Update last activity timestamp
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', token);

      if (updateError) {
        console.warn('Failed to update session activity:', updateError);
      }
    }

    return !!isValid;
  } catch (error) {
    console.error('Unexpected error validating session:', error);
    return false;
  }
};

export const invalidateSessionToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    console.log('Invalidating session token');
    const { error } = await supabase
      .from('sessions')
      .update({ 
        status: 'invalidated',
        invalidated_at: new Date().toISOString()
      })
      .eq('session_token', token);

    if (error) {
      console.error('Error invalidating session token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error invalidating session:', error);
    return false;
  }
};

export const invalidateAllUserSessions = async (userId: string): Promise<boolean> => {
  try {
    console.log('Invalidating all sessions for user:', userId);
    const { error } = await supabase
      .from('sessions')
      .update({ 
        status: 'invalidated',
        invalidated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error invalidating all user sessions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error invalidating all user sessions:', error);
    return false;
  }
};
