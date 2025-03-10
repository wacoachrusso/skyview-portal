import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Handling Google auth callback');
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: sessionError.message || "Failed to authenticate with Google."
          });
          navigate('/login');
          return;
        }

        if (!session?.user) {
          console.log('No session found');
          navigate('/login');
          return;
        }

        console.log('Session found for user:', session.user.email);
        console.log('User ID:', session.user.id);

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single(); // Use .single() to ensure only one profile is returned

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

        // Check and update subscription plan if null
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

        // Check job role and airline
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

        // All checks passed, redirect to chat
        console.log('Auth callback successful, redirecting to chat');
        navigate('/chat');
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  // Show loading state while processing
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Processing authentication...</p>
      </div>
    );
  }

  return null;
};