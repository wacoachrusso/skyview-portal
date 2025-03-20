import { supabase } from "@/integrations/supabase/client";

export const createNewSession = async (userId: string): Promise<any> => {
  console.log('Creating new session for user:', userId);
  
  try {
    // First check if there's already an active session for this user
    const { data: existingSessions, error: checkError } = await supabase
      .from('sessions')
      .select('session_token, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing sessions:', checkError);
    } else if (existingSessions && existingSessions.length > 0) {
      console.log('Found existing active session, using it');
      localStorage.setItem('session_token', existingSessions[0].session_token);
      
      // Update last activity timestamp
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', existingSessions[0].session_token);
        
      if (updateError) {
        console.warn('Failed to update session activity:', updateError);
      }
      
      return existingSessions[0];
    }

    // Only invalidate other sessions if we're creating a new one
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
    let deviceInfo: Record<string, any> = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };
    
    let ipAddress = 'unknown';
    
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        ipAddress = data.ip || 'unknown';
        deviceInfo.ip = ipAddress;
      } else {
        console.warn('Could not fetch IP info:', response.statusText);
      }
    } catch (error) {
      console.warn('Could not fetch IP info:', error);
    }

    // Create new session with a longer expiration time (24 hours instead of 15 minutes)
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours expiration
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
      
      // Set cookie with refresh token for additional persistence
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
    } else {
      console.log('Session token is invalid or expired');
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
