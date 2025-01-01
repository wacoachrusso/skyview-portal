import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const checkExistingProfile = async (email: string) => {
  console.log('Checking profile for:', email);
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  return { profile, error: profileError };
};

const handleProfileCheck = async (email: string, toast: any) => {
  const { profile, error } = await checkExistingProfile(email);
  
  if (error || !profile) {
    console.log('No profile found, signing out');
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Account Required",
      description: "Please sign up for an account first before signing in with Google."
    });
    return false;
  }
  return true;
};

const initiateGoogleAuth = async () => {
  console.log('Initiating Google OAuth');
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${window.location.origin}/auth/callback?provider=google`
    }
  });
};

const verifyEmailConfirmation = async (user: any, toast: any) => {
  if (!user.email_confirmed_at) {
    console.log('Email not verified');
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Email verification required",
      description: "Please verify your email address before signing in."
    });
    return false;
  }
  return true;
};

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Starting Google Sign In Process ===');
      
      // Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verify existing profile if session exists
      if (session?.user?.email) {
        console.log('Active session found, checking profile');
        const profileValid = await handleProfileCheck(session.user.email, toast);
        if (!profileValid) {
          navigate('/signup');
          return;
        }
      }

      // Proceed with Google OAuth
      const { data, error } = await initiateGoogleAuth();

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      // Verify user after OAuth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('Checking profile after OAuth');
        const profileValid = await handleProfileCheck(user.email!, toast);
        if (!profileValid) {
          navigate('/signup');
          return;
        }

        const emailVerified = await verifyEmailConfirmation(user, toast);
        if (!emailVerified) {
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