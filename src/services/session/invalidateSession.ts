
import { supabase } from "@/integrations/supabase/client";

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
