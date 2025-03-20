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
    let deviceInfo = { ip: 'unknown' };
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      deviceInfo = await response.json();
    } catch (error) {
      console.error('Error fetching device info:', error);
    }

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
    if (!sessionToken) {
      console.error('Cannot update session activity: No session token provided');
      return;
    }
    
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

// Add a new function to refresh the session if needed
export const refreshSessionIfNeeded = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session or near expiry (within 5 minutes), refresh
    if (!session || (session.expires_at && new Date(session.expires_at * 1000) <= new Date(Date.now() + 5 * 60 * 1000))) {
      console.log('Session needs refreshing');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data.session) {
        console.log('Session refreshed successfully');
        return true;
      }
    }
    
    return !!session; // Return true if session exists
  } catch (error) {
    console.error('Error in refreshSessionIfNeeded:', error);
    return false;
  }
};
