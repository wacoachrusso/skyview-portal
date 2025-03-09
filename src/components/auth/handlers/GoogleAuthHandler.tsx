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
          navigate('/?scrollTo=pricing-section');
          return;
        }

        if (!session?.user) {
          console.log('No session found');
          navigate('/login');
          return;
        }

        console.log('Session found for user:', session.user.email);
        console.log('User ID:', session.user.id);

        // First check if user has a profile by ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        console.log('Profile check result:', { profile, profileError });

        // Check if the profile is marked as deleted and reactivate if needed
        if (profile && profile.account_status === 'deleted') {
          console.log('Found deleted account, attempting to reactivate');
          // Implement reactivation logic here
          return;
        }

        // If no profile found by ID, try finding by email
        if (!profile && session.user.email) {
          console.log('No profile found by ID, checking by email');
          const { data: emailProfile, error: emailProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();
            
          console.log('Email profile check result:', { emailProfile, emailProfileError });
          
          if (emailProfile) {
            // Check if the profile by email is marked as deleted
            if (emailProfile.account_status === 'deleted') {
              console.log('Found deleted account by email, attempting to reactivate');
              // Implement reactivation logic here
              return;
            }
            
            // Profile exists but with different ID, update to match auth ID
            console.log('Updating profile ID to match auth ID');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ id: session.user.id })
              .eq('id', emailProfile.id);
              
            if (updateError) {
              console.error('Error updating profile ID:', updateError);
              toast({
                variant: "destructive",
                title: "Profile Update Failed",
                description: "Failed to update profile. Please try again."
              });
              navigate('/login');
              return;
            } else {
              // Redirect to dashboard after successfully updating the profile
              navigate('/chat');
              return;
            }
          } else {
            console.log('No profile found by email either');
            // No profile found, redirect to sign up
            toast({
              title: "Welcome to SkyGuide!",
              description: "Please select a subscription plan to get started."
            });
            navigate('/?scrollTo=pricing-section');
            return;
          }
        } else if (profile) {
          // Active profile found, proceed with regular flow
          
          // Check subscription status
          if (!profile.subscription_plan || profile.subscription_plan === 'free') {
            // Check if free trial is exhausted
            if (profile.query_count >= 1) {
              console.log('Free trial exhausted, redirecting to pricing');
              toast({
                title: "Free Trial Ended",
                description: "Please select a subscription plan to continue."
              });
              navigate('/?scrollTo=pricing-section');
              return;
            }
          }
          
          // Check if user role and airline are set up
          if (!profile.user_type || !profile.airline) {
            console.log("User role or airline not set up");
            toast({
              variant: "destructive",
              title: "Profile Incomplete",
              description: "You need to set up your role and airline in your account to use your specific assistant.",
            });
            setIsProcessing(false);
            navigate("/account"); // Redirect to account page to complete setup
            return;
          }
          
          console.log('Auth callback successful, redirecting to dashboard');
          navigate('/chat');
          return;
        }
        
        // If no profile found at all
        console.log('No profile found, redirecting to signup');
        toast({
          title: "Welcome to SkyGuide!",
          description: "Please select a subscription plan to get started."
        });
        navigate('/?scrollTo=pricing-section');
        
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

  // Optional: Show loading state while processing
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Processing authentication...</p>
      </div>
    );
  }

  return null;
};