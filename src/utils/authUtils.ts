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
    
    // Get the origin without any trailing colons
    const baseUrl = window.location.origin.replace(/:\/?$/, '');
    const redirectUrl = `${baseUrl}/reset-password`;
    
    console.log('Reset redirect URL:', redirectUrl);
    
    // Using the edge function for better reliability and custom emails
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      console.error('Error from Supabase auth:', error);
      throw error;
    }
    
    console.log('Password reset email sent via Supabase auth');
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred during password reset'
    };
  }
}
