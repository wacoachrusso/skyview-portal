import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoginFormData } from "../useLoginFormState";

export const useLoginValidation = () => {
  const { toast } = useToast();

  const validateLoginAttempt = async (formData: LoginFormData, isTestEnvironment: boolean) => {
    console.log('Validating login attempt for:', formData.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (error) {
      console.error('Login validation error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      return { success: false, data: null, error };
    }

    if (!data.session) {
      console.error('No session created after login');
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Failed to create session",
      });
      return { success: false, data: null, error: new Error('No session created') };
    }

    if (!data.user.email_confirmed_at && !isTestEnvironment) {
      console.log('Email not verified');
      await handleUnverifiedEmail(formData.email);
      return { success: false, data: null, error: new Error('Email not verified') };
    }

    return { success: true, data, error: null };
  };

  const handleUnverifiedEmail = async (email: string) => {
    await supabase.auth.signOut();
    
    try {
      const { error: emailError } = await supabase.functions.invoke('send-signup-confirmation', {
        body: { 
          email,
          confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`
        }
      });

      if (emailError) throw emailError;

      toast({
        variant: "destructive",
        title: "Email not verified",
        description: "Please check your inbox and verify your email address before signing in.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification email. Please try again or contact support.",
      });
    }
  };

  return { validateLoginAttempt };
};