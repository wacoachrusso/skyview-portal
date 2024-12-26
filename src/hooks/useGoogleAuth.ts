import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Google Sign In Process Started ===');
      console.log('Current URL:', window.location.origin);
      console.log('Full Current URL:', window.location.href);
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Configured Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
          },
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Google sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        throw error;
      }

      console.log('Sign in initiated successfully:', {
        provider: data?.provider,
        url: data?.url
      });
      
    } catch (error) {
      console.error('=== Detailed Google Sign In Error ===');
      console.error('Error object:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
      
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again."
      });
    }
  };

  return { handleGoogleSignIn };
};