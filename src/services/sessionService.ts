
import { supabase } from "@/integrations/supabase/client";

export const createNewSession = async (userId: string): Promise<any> => {
  console.log('Creating new session for user:', userId);
  
  try {
    // First invalidate any existing sessions
    try {
      const { error: invalidateError } = await supabase
        .rpc('invalidate_other_sessions', {
          p_user_id: userId,
          p_current_session_token: localStorage.getItem('session_token') || ''
        });

      if (invalidateError) {
        console.error('Error invalidating existing sessions:', invalidateError);
      }
    } catch (err) {
      console.error('Failed to invalidate other sessions:', err);
    }

    // Create new session token
    const sessionToken = crypto.randomUUID();

    // Get device info - handle errors gracefully
    let deviceInfo: Record<string, any> = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };
    
    // Set default IP address
    let ipAddress = 'unknown';
    
    // Create new session
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
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
    
    // Ensure refresh token is stored
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (authSession?.refresh_token) {
      localStorage.setItem('supabase.refresh-token', authSession.refresh_token);
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
      try {
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('session_token', token);

        if (updateError) {
          console.warn('Failed to update session activity:', updateError);
        }
      } catch (updateErr) {
        console.warn('Error updating session activity:', updateErr);
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
