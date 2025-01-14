import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkSession, checkUserProfile } from "@/utils/authCallbackUtils";
import { handleSelectedPlan } from "@/utils/authCallbackHandlers";

export const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('selectedPlan');
  const priceId = searchParams.get('priceId');

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('=== Google Auth Flow Start ===');
      console.log('Selected plan:', selectedPlan);
      console.log('Price ID:', priceId);

      try {
        const session = await checkSession({ navigate, toast });
        if (!session) return;

        console.log('Session found for user:', session.user.email);

        // Check if user has a profile
        const profile = await checkUserProfile(session.user.id, { navigate, toast });
        if (!profile) return;

        // Always handle paid plan subscription first
        if (await handleSelectedPlan(selectedPlan, { navigate, toast })) {
          return;
        }

        // Enforce subscription requirement
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No valid subscription found, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        console.log('=== Google Auth Flow Complete ===');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error in Google auth callback:', error);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try again."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, selectedPlan, priceId]);

  return null;
};