import { supabase } from "@/integrations/supabase/client";

export const handleEmailVerification = async (email: string) => {
  console.log('Sending email verification for:', email);
  try {
    // Construct the URL properly without any trailing colons
    const baseUrl = window.location.origin.replace(/:\/?$/, ''); // Remove any trailing colon
    const confirmationUrl = `${baseUrl}/auth/callback?email=${encodeURIComponent(email)}`;
    
    console.log('Confirmation URL:', confirmationUrl); // Log the URL for debugging
    
    const { error } = await supabase.functions.invoke('send-signup-confirmation', {
      body: { 
        email,
        confirmationUrl
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

export const handlePasswordReset = async (email: string) => {
  try {
    console.log('Starting password reset process for:', email);
    
    const baseUrl = window.location.origin.replace(/:\/?$/, '');
    const resetUrl = `${baseUrl}/reset-password`;
    
    const { error } = await supabase.functions.invoke('send-password-reset', {
      body: { 
        email: email.trim(),
        resetUrl
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