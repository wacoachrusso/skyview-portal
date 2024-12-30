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

    // First clear any existing session
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

    console.log('Redirecting to reset password page');
    navigate('/reset-password');
    return true;
  };

  return { processPasswordReset };
};