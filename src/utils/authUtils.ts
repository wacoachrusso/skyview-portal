import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const sendMagicLink = async (email: string) => {
  try {
    console.log('Starting magic link login process for:', email);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    // Send custom email using our Edge Function
    await supabase.functions.invoke('send-login-link', {
      body: { email }
    });

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
  await supabase.functions.invoke('send-signup-confirmation', {
    body: { 
      email,
      confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`
    }
  });
};