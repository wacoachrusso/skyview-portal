import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Initiating Google sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again."
      });
    }
  };

  return { handleGoogleSignIn };
};