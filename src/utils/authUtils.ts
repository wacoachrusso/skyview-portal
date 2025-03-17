
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
    
    // Create a clean base URL
    const baseUrl = window.location.origin.replace(/:\/?$/, '');
    
    // Important: Don't include the token in the URL - Supabase will do this
    // Set only the base path where the user should land after clicking the link
    const resetUrl = `${baseUrl}/reset-password`;
    
    console.log('Reset URL that will be used:', resetUrl);
    
    // Use Supabase's built-in password reset function
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl
    });

    if (error) {
      console.error('Error from Supabase resetPasswordForEmail:', error);
      throw error;
    }
    
    console.log('Password reset email sent via Supabase');
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred during password reset'
    };
  }
}
