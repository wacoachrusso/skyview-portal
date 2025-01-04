import { supabase } from "@/integrations/supabase/client";

export const validateSessionToken = async (sessionToken: string): Promise<boolean> => {
  console.log('Validating session token:', sessionToken);
  
  try {
    const { data: isValid, error } = await supabase
      .rpc('is_session_valid', {
        p_session_token: sessionToken
      });

    if (error) {
      console.error('Error validating session:', error);
      return false;
    }

    return isValid;
  } catch (error) {
    console.error('Error in session validation:', error);
    return false;
  }
};

export const checkActiveSession = async (userId: string, sessionToken: string): Promise<boolean> => {
  console.log('Checking active session for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('session_token, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error checking active session:', error);
      return false;
    }

    return data?.session_token === sessionToken;
  } catch (error) {
    console.error('Error in active session check:', error);
    return false;
  }
};