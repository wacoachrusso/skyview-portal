
import { supabase } from "@/integrations/supabase/client";
import { getDeviceInfo } from "./deviceInfo";

export const createNewSession = async (userId: string): Promise<any> => {
  console.log('Creating new session for user:', userId);
  
  try {
    // First invalidate any existing sessions - forcefully end all other sessions
    const { error: invalidateError } = await supabase
      .rpc('invalidate_other_sessions', {
        p_user_id: userId,
        p_current_session_token: localStorage.getItem('session_token') || ''
      });

    if (invalidateError) {
      console.error('Error invalidating existing sessions:', invalidateError);
      // Continue despite error, as this might be the first session
    }

    // Create new session token with a longer expiration (2 hours)
    const sessionToken = crypto.randomUUID();

    // Get device info
    const deviceInfo = await getDeviceInfo();
    let ipAddress = deviceInfo.ip || 'unknown';
    
    // Create new session with 2 hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2); // 2 hour expiration
    
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
        status: 'active',
        last_activity: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
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
