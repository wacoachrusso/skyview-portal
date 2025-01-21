import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const checkExistingProfile = async (email: string) => {
  console.log('Checking for existing profile with email:', email);
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  return { profile, error };
};

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in process');
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        console.error('Google sign-in error:', signInError);
        toast({
          variant: "destructive",
          title: "Sign Up Required",
          description: "Please sign up and select a subscription plan to continue.",
        });
        navigate('/?scrollTo=pricing-section');
        return;
      }

      // Get the current session to access user data
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        console.log('Google auth successful, checking profile');
        const { profile, error: profileError } = await checkExistingProfile(session.user.email);

        if (profileError || !profile) {
          console.log('No existing profile found, redirecting to pricing');
          toast({
            title: "Welcome to SkyGuide!",
            description: "Please select a subscription plan to get started.",
          });
          await supabase.auth.signOut();
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Check if account is active and has valid subscription
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No subscription plan, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue.",
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        if (profile.account_status === 'deleted') {
          console.log('Account is deleted, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Unavailable",
            description: "This account has been deleted. Please create a new account with a different email."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        console.log('Profile verified, proceeding with login');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      toast({
        title: "Welcome to SkyGuide!",
        description: "Please select a subscription plan to get started.",
      });
      navigate('/?scrollTo=pricing-section');
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, loading };
};