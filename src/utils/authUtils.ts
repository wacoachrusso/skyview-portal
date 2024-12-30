import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const sendMagicLink = async (email: string) => {
  try {
    if (!email || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    console.log('Starting magic link login process for:', email);
    
    // Generate OTP token via Supabase but don't send email
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    // Send custom email using our Edge Function
    const { error: emailError } = await supabase.functions.invoke('send-login-link', {
      body: { 
        email: email.trim(),
        loginUrl: `${window.location.origin}/auth/callback`
      }
    });

    if (emailError) throw emailError;

    toast({
      title: "Check your email",
      description: "We've sent you a magic link to sign in.",
    });
  } catch (error) {
    console.error('Magic link error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Could not send login link. Please try again.",
    });
  }
};

export const handleEmailVerification = async (email: string) => {
  try {
    if (!email || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    const { error } = await supabase.functions.invoke('send-signup-confirmation', {
      body: { 
        email: email.trim(),
        confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email.trim())}`
      }
    });

    if (error) throw error;

    toast({
      title: "Verification email sent",
      description: "Please check your inbox and verify your email address.",
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Could not send verification email. Please try again.",
    });
  }
};

export const handlePasswordReset = async (email: string) => {
  try {
    if (!email || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    console.log('Starting password reset process for:', email);

    const { error } = await supabase.functions.invoke('send-password-reset', {
      body: { 
        email: email.trim(),
        resetUrl: `${window.location.origin}/reset-password` // Updated to point directly to reset-password page
      }
    });

    if (error) throw error;

    toast({
      title: "Check your email",
      description: "We've sent you instructions to reset your password.",
    });
  } catch (error) {
    console.error('Password reset error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Could not send password reset email. Please try again.",
    });
  }
};