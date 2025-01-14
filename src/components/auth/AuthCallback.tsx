import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const provider = searchParams.get("provider");

  if (provider === "google") {
    return <GoogleAuthHandler />;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Handling auth callback...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          throw new Error("Invalid session");
        }

        // Check if user exists in profiles and their subscription status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profileError || !profile) {
          console.log('No profile found, redirecting to signup');
          await supabase.auth.signOut();
          toast({
            title: "Welcome to SkyGuide!",
            description: "Please select a subscription plan to get started."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // If user selected a paid plan but hasn't completed payment, redirect to pricing
        if (profile.subscription_plan === 'monthly' || profile.subscription_plan === 'yearly') {
          console.log('Paid plan user detected, checking payment status...');
          
          // Call Stripe edge function to verify subscription
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke(
            'check-subscription-status',
            {
              body: { email: session.user.email }
            }
          );

          if (stripeError || !stripeData?.isSubscribed) {
            console.log('No active subscription found, redirecting to pricing');
            await supabase.auth.signOut();
            toast({
              title: "Payment Required",
              description: "Please complete your subscription payment to continue."
            });
            navigate('/?scrollTo=pricing-section');
            return;
          }
        }

        // Create a new session and invalidate others
        console.log("Creating new session and invalidating others...");
        const newSession = await createNewSession(session.user.id);
        
        if (!newSession) {
          throw new Error("Failed to create new session");
        }

        // All good, redirect to dashboard
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in. Any other active sessions have been ended."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error("Error in auth callback:", error);
        toast({
          title: "Welcome to SkyGuide!",
          description: "Please select a subscription plan to get started."
        });
        navigate('/?scrollTo=pricing-section');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, createNewSession]);

  return null;
};