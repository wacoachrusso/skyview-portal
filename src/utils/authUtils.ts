import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const handlePasswordReset = async (email: string) => {
  try {
    console.log('Starting password reset process for:', email);
    
    const { error } = await supabase.functions.invoke('send-password-reset', {
      body: { 
        email: email.trim(),
        resetUrl: `${window.location.origin}/reset-password` // Direct to reset password page
      }
    });

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred during password reset'
    };
  }
}
