import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Initiating Google sign in...');
      console.log('Current URL:', window.location.href);
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      console.log('Sign in initiated successfully:', data);
    } catch (error) {
      console.error('Detailed error in Google sign in:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again."
      });
    }
  };

  return { handleGoogleSignIn };
};