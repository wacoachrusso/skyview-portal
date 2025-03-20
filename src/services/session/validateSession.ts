
import { supabase } from "@/integrations/supabase/client";

export const validateSessionToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    // Skip validation during API calls
    if (sessionStorage.getItem('api_call_in_progress') === 'true') {
      console.log("API call in progress, skipping token validation");
      return true;
    }
    
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
        .update({ 
          last_activity: new Date().toISOString() 
        })
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

// Update session activity without validation - CRITICAL for API calls
export const updateSessionApiActivity = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    console.log('Updating session activity during API call');
    // Just update the last activity timestamp directly without validation
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        last_activity: new Date().toISOString() 
      })
      .eq('session_token', token);

    if (updateError) {
      console.warn('Failed to update API activity timestamp:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating API activity:', error);
    return false;
  }
};
