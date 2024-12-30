import { supabase } from "@/integrations/supabase/client";

export const handleEmailVerification = async (email: string) => {
  console.log('Sending email verification for:', email);
  try {
    const { error } = await supabase.functions.invoke('send-signup-confirmation', {
      body: { 
        email,
        confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`
      }
    });

    if (error) throw error;
    
    console.log('Email verification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification email'
    };
  }
}
