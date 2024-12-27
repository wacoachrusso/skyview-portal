import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Google Sign In Process Started ===');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      // Check if the sign-in was cancelled or failed
      if (error) {
        console.error('Google sign in error:', error);
        if (error.message.includes('closed')) {
          toast({
            variant: "default",
            title: "Sign in cancelled",
            description: "You cancelled the Google sign in process."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: "Could not sign in with Google. Please try again."
          });
        }
        return;
      }

      if (!data.provider) {
        console.log('Sign in cancelled or failed');
        return;
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