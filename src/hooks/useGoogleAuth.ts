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

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Starting Google Sign In Process ===');
      
      // Sign out any existing sessions before starting new sign in
      await supabase.auth.signOut({ scope: 'global' });
      
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

      // Get user data after OAuth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('Checking if user exists in profiles');
        const { profile, error: profileError } = await checkExistingProfile(user.email!);

        if (profileError || !profile) {
          console.log('No existing profile found, redirecting to pricing');
          toast({
            variant: "destructive",
            title: "Account Required",
            description: "Please sign up and select a plan before logging in with Google."
          });
          await supabase.auth.signOut();
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Check if account is active
        if (profile.account_status !== 'active') {
          console.log('Account not active:', profile.account_status);
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Not Active",
            description: "Your account is not active. Please contact support."
          });
          navigate('/login');
          return;
        }

        // Check if email is verified
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
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
        
        // Check if profile is complete
        if (profile.user_type && profile.airline) {
          navigate('/dashboard');
        } else {
          navigate('/complete-profile');
        }
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