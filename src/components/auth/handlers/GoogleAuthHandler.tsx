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
          await reactivateAccount(profile, session.user);
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
              await reactivateAccount(emailProfile, session.user);
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
    
    const reactivateAccount = async (deletedProfile: any, user: any) => {
      try {
        console.log("Attempting to reactivate deleted account:", deletedProfile.id);
        
        // Update the profile to reactivate it
        const { data: reactivatedProfile, error: reactivationError } = await supabase
          .from('profiles')
          .update({
            account_status: 'active',
            // Set to free plan initially
            subscription_plan: 'free',
            // Reset query count
            query_count: 0,
            // Update timestamp
            last_query_timestamp: new Date().toISOString(),
            // Ensure ID matches auth ID
            id: user.id
          })
          .eq('email', user.email)
          .select()
          .single();
        
        if (reactivationError) {
          console.error("Error reactivating account:", reactivationError);
          throw reactivationError;
        }
        
        console.log("Account successfully reactivated:", reactivatedProfile);
        
        // Show success toast
        toast({
          title: "Account Reactivated",
          description: "Your account has been successfully reactivated. Please upgrade your subscription plan.",
        });
        
        // Redirect to pricing section
        navigate('/?scrollTo=pricing-section');
        
      } catch (error) {
        console.error("Failed to reactivate account:", error);
        toast({
          variant: "destructive",
          title: "Reactivation Failed",
          description: "We couldn't reactivate your account. Please try again or contact support.",
        });
        
        // Sign out the user if reactivation fails
        await supabase.auth.signOut();
        navigate('/login');
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