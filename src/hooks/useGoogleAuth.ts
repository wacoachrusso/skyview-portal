import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Google Sign In Process Started ===');
      
      // Get the preview URL from window.location
      const currentUrl = window.location.origin;
      console.log('Current URL:', currentUrl);
      
      // Construct the redirect URL using the current origin
      const redirectUrl = `${currentUrl}/auth/callback`;
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      console.log('Sign in initiated:', data);
      
    } catch (error) {
      console.error('=== Google Sign In Error ===');
      console.error('Error details:', error);
      
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again."
      });
    }
  };

  return { handleGoogleSignIn };
};