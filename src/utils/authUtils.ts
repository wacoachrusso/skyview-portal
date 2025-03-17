
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
    
    // Clean up the email input
    const cleanEmail = email.trim().toLowerCase();
    
    // Get the origin with protocol
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/reset-password`;
    
    console.log('Reset redirect URL:', redirectUrl);
    
    // Use our custom edge function to send the password reset email
    const { data, error } = await supabase.functions.invoke('send-password-reset', {
      body: { 
        email: cleanEmail,
        redirectUrl
      }
    });

    console.log('Edge function response:', data, error);

    if (error) {
      console.error('Error from edge function:', error);
      throw error;
    }
    
    console.log('Password reset email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred during password reset'
    };
  }
}
