import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: "Welcome to SkyGuide!",
            description: "Please select a subscription plan to get started."
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

        // Handle paid plan subscription first
        if (selectedPlan && selectedPlan !== 'free' && priceId) {
          console.log('Creating checkout session for paid plan...');
          try {
            const { data, error: checkoutError } = await supabase.functions.invoke(
              'create-checkout-session',
              {
                body: {
                  priceId,
                  email: session.user.email,
                  userId: session.user.id
                }
              }
            );

            if (checkoutError) throw checkoutError;
            if (!data?.url) throw new Error('No checkout URL received');

            console.log('Redirecting to Stripe checkout:', data.url);
            window.location.href = data.url;
            return;
          } catch (error) {
            console.error('Error creating checkout session:', error);
            toast({
              variant: "destructive",
              title: "Payment Error",
              description: "Failed to setup payment. Please try again."
            });
            await supabase.auth.signOut();
            navigate('/?scrollTo=pricing-section');
            return;
          }
        }

        // Check if user has a profile and subscription
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.log('No profile found, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            title: "Welcome to SkyGuide!",
            description: "Please select a subscription plan to get started."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Enforce subscription requirement - only allow access with valid paid subscription
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No valid subscription plan found, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        console.log('=== Google Auth Flow Complete ===');
        console.log('Auth callback successful, redirecting to dashboard');
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