import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  checkSession,
  getCurrentUser,
  signOutGlobally,
  reAuthenticateSession,
  checkUserProfile
} from "@/utils/authCallbackUtils";

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check session validity
        const session = await checkSession({ navigate, toast });
        if (!session) return;

        // Get current user
        const user = await getCurrentUser({ navigate, toast });
        if (!user) return;

        // Sign out all other sessions
        const signOutSuccess = await signOutGlobally({ navigate, toast });
        if (!signOutSuccess) return;

        // Re-authenticate if needed
        if (session.provider_token) {
          const reAuthSuccess = await reAuthenticateSession('google', { navigate, toast });
          if (!reAuthSuccess) return;
        }

        // Check user profile
        const profile = await checkUserProfile(user.id, { navigate, toast });
        if (!profile) return;

        // Get the selected plan from URL state
        const params = new URLSearchParams(window.location.search);
        const selectedPlan = params.get('selectedPlan');

        // If there's a selected plan that's not free, create checkout session
        if (selectedPlan && selectedPlan !== 'free') {
          console.log('Creating checkout session for plan:', selectedPlan);
          try {
            const priceId = selectedPlan.toLowerCase() === 'monthly' 
              ? 'price_1QcfUFA8w17QmjsPe9KXKFpT' 
              : 'price_1QcfWYA8w17QmjsPZ22koqjj';

            const response = await supabase.functions.invoke('create-checkout-session', {
              body: JSON.stringify({
                priceId,
                mode: 'subscription',
              }),
            });

            if (response.error) throw response.error;
            const { data: { url } } = response;
            
            if (url) {
              console.log('Redirecting to checkout:', url);
              window.location.href = url;
              return;
            }
          } catch (error) {
            console.error('Error creating checkout session:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to process payment. Please try again.",
            });
            navigate('/dashboard');
            return;
          }
        }

        // Handle profile completion status for free plan or fallback
        if (!profile.user_type || !profile.airline) {
          console.log('Profile incomplete, redirecting to complete profile');
          navigate('/complete-profile');
          return;
        }

        console.log('Profile complete, redirecting to dashboard');
        toast({
          title: "Login Successful",
          description: "You've been signed in. Any other active sessions have been signed out for security."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error('Unexpected error in callback:', error);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return null;
}