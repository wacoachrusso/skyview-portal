import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Google Sign In Process Started ===');
      
      // First check if the user already exists
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (!existingProfile) {
          console.log('User not found in profiles, signing out');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account not found",
            description: "Please sign up for an account first before signing in with Google."
          });
          navigate('/signup');
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
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

      // Check if the user exists and has verified their email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        console.log('Email not verified for Google user');
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Email verification required",
          description: "Please verify your email address before signing in."
        });
        navigate('/login');
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