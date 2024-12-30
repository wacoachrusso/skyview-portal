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
    console.log('Processing password reset with tokens:', { accessToken, refreshToken });
    
    if (!accessToken || !refreshToken) {
      console.error('Missing tokens for password reset');
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired."
      });
      navigate('/login', { replace: true });
      return false;
    }

    try {
      // First ensure we're starting fresh by signing out
      await supabase.auth.signOut();
      console.log('Cleared existing session');

      // Set the session with the recovery tokens
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
        navigate('/login', { replace: true });
        return false;
      }

      console.log('Successfully set recovery session');
      return true;
    } catch (error) {
      console.error('Error in processPasswordReset:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during password reset. Please try again."
      });
      navigate('/login', { replace: true });
      return false;
    }
  };

  return { processPasswordReset };
};