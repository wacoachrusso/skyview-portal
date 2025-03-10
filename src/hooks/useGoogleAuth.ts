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
    .maybeSingle();

  console.log('Profile check result:', { profile, error });
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

      // Step 1: Start OAuth flow
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
          title: "Sign In Failed",
          description: signInError.message || "Failed to sign in with Google.",
        });
        navigate('/login');
        return;
      }

      // Step 2: Wait for the redirect to complete and get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: sessionError?.message || "Failed to retrieve session."
        });
        navigate('/login');
        return;
      }

      console.log('Session found for user:', session.user.email);

      // Step 3: Check if the user has an existing profile
      const { profile, error: profileError } = await checkExistingProfile(session.user.email!);

      if (profileError) {
        console.error('Profile error:', profileError);
        toast({
          variant: "destructive",
          title: "Profile Error",
          description: "Failed to fetch user profile."
        });
        navigate('/login');
        return;
      }

      // If no profile found, redirect to signup
      if (!profile) {
        console.log('No profile found, redirecting to signup');
        toast({
          title: "Welcome!",
          description: "Please complete your profile to get started."
        });
        navigate('/signup');
        return;
      }

      // Step 4: Update subscription plan if null
      if (profile.subscription_plan === null) {
        console.log('Subscription plan is null, updating to free');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ subscription_plan: 'free' })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('Error updating subscription plan:', updateError);
          toast({
            variant: "destructive",
            title: "Subscription Update Failed",
            description: "Failed to update subscription plan. Please try again."
          });
          navigate('/login');
          return;
        }

        console.log('Subscription plan updated to free');
      }

      // Step 5: Check job role and airline
      if (!profile.user_type || !profile.airline) {
        console.log('Job role or airline not set up');
        toast({
          variant: "destructive",
          title: "Profile Incomplete",
          description: "You need to set up your job role and airline to use your specific assistant."
        });
        navigate('/account'); // Redirect to account page to complete setup
        return;
      }

      // Step 6: All checks passed, redirect to chat
      console.log('Auth callback successful, redirecting to chat');
      navigate('/chat');
      
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
      });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, loading };
};