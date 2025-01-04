import { supabase } from "@/integrations/supabase/client";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const checkExistingProfile = async (email: string) => {
  console.log('Checking existing profile for:', email);
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('id, login_attempts, account_status')
    .eq('email', email.trim())
    .single();

  if (error) {
    console.error('Error checking profile:', error);
    throw error;
  }

  return profileData;
};

export const checkExistingSessions = async (userId: string) => {
  console.log('Checking existing sessions for user:', userId);
  const { data: existingSessions, error } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error checking sessions:', error);
    throw error;
  }

  return existingSessions;
};

export const updateLoginAttempts = async (email: string, attempts: number, status: string) => {
  console.log('Updating login attempts for:', email);
  const { error } = await supabase
    .from('profiles')
    .update({ 
      login_attempts: attempts,
      account_status: status
    })
    .eq('email', email.trim());

  if (error) {
    console.error('Error updating login attempts:', error);
    throw error;
  }
};

export const resetLoginAttempts = async (email: string) => {
  console.log('Resetting login attempts for:', email);
  const { error } = await supabase
    .from('profiles')
    .update({ 
      login_attempts: 0,
      account_status: 'active'
    })
    .eq('email', email.trim());

  if (error) {
    console.error('Error resetting login attempts:', error);
    throw error;
  }
};