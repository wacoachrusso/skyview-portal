import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Starting Google Sign In Process ===');
      
      // First check if the user already exists in auth
      const { data: { session } } = await supabase.auth.getSession();
      
      // If there's an active session, check the profile
      if (session?.user?.email) {
        console.log('Active session found, checking profile for:', session.user.email);
        
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profileError || !existingProfile) {
          console.log('No profile found, signing out');
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

      // Proceed with Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback?provider=google`
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      // After OAuth, check if the user exists and has verified their email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('Checking profile after OAuth for:', user.email);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (profileError || !profile) {
          console.log('No profile found after OAuth, signing out');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account not found",
            description: "Please sign up for an account first before signing in with Google."
          });
          navigate('/signup');
          return;
        }

        if (!user.email_confirmed_at) {
          console.log('Email not verified');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Email verification required",
            description: "Please verify your email address before signing in."
          });
          navigate('/login');
          return;
        }

        console.log('Successful Google sign in with existing profile');
      }
      
    } catch (error) {
      console.error('=== Google Sign In Error ===');
      console.error('Error details:', error);
      
      await supabase.auth.signOut();
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Could not sign in with Google. Please try again."
      });
    }
  };

  return { handleGoogleSignIn };
};