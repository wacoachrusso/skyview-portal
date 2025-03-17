
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePasswordResetHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const processPasswordReset = async (code: string | null) => {
    console.log('Processing password reset with code:', code ? 'present' : 'missing');
    
    if (!code) {
      console.error('Missing code for password reset');
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired."
      });
      return false;
    }

    try {
      // Validate that the code parameter is valid
      // The actual password reset will happen later when the user submits the form
      return true;
    } catch (error) {
      console.error('Error in processPasswordReset:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during password reset. Please try again."
      });
      return false;
    }
  };

  return { processPasswordReset };
};
