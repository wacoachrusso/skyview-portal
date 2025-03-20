import { supabase } from "@/integrations/supabase/client";

export const createNewSession = async (userId: string) => {
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

export const invalidateAllUserSessions = async (userId: string) => {
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

export const refreshSession = async () => {
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

export const updateSessionActivity = async (sessionToken: string) => {
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