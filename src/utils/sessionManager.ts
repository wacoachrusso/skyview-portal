import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const createNewSession = async (userId: string) => {
  console.log('Creating new session for user:', userId);
  
  try {
    const sessionToken = crypto.randomUUID();
    const { data: deviceInfo } = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json());

    const { data: session, error } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: deviceInfo?.ip
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('New session created:', session);
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const invalidateOtherSessions = async (userId: string, currentSessionToken: string) => {
  console.log('Invalidating other sessions for user:', userId);
  
  try {
    const { error } = await supabase
      .rpc('invalidate_other_sessions', {
        p_user_id: userId,
        p_current_session_token: currentSessionToken
      });

    if (error) throw error;
    console.log('Other sessions invalidated successfully');
  } catch (error) {
    console.error('Error invalidating other sessions:', error);
    throw error;
  }
};

export const validateSession = async (sessionToken: string): Promise<boolean> => {
  console.log('Validating session token');
  
  try {
    const { data: isValid, error } = await supabase
      .rpc('is_session_valid', {
        p_session_token: sessionToken
      });

    if (error) throw error;
    return isValid;
  } catch (error) {
    console.error('Error validating session:', error);
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

export const invalidateCurrentSession = async (userId: string) => {
  console.log('Invalidating current session:', userId);
  
  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'invalidated',
        invalidated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Session invalidated successfully');
  } catch (error) {
    console.error('Error invalidating session:', error);
    throw error;
  }
};