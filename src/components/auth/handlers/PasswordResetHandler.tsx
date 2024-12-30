import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PasswordResetHandlerProps {
  accessToken: string | null;
  refreshToken: string | null;
}

export const PasswordResetHandler = ({ accessToken, refreshToken }: PasswordResetHandlerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const processPasswordReset = async () => {
    console.log('Processing password reset');
    
    if (!accessToken || !refreshToken) {
      console.error('Missing tokens for password reset');
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired."
      });
      navigate('/login');
      return false;
    }

    try {
      // First ensure we're starting fresh
      await supabase.auth.signOut();
      console.log('Cleared existing session');

      // Set a temporary session just for password reset
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        console.error('Error setting recovery session:', sessionError);
        toast({
          variant: "destructive",
          title: "Reset link expired",
          description: "Please request a new password reset link."
        });
        navigate('/login');
        return false;
      }

      // Set a flag in localStorage to indicate we're in password reset mode
      localStorage.setItem('password_reset_mode', 'true');
      
      console.log('Redirecting to reset password page');
      navigate('/reset-password');
      return true;
    } catch (error) {
      console.error('Error in processPasswordReset:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during password reset. Please try again."
      });
      navigate('/login');
      return false;
    }
  };

  return { processPasswordReset };
};