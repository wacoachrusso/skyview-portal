import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          throw new Error("Invalid session");
        }

        // Check if user exists in profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profileError || !profile) {
          console.log('No profile found, redirecting to signup/pricing');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Required",
            description: "Please sign up and select a plan before logging in with Google."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // Check if profile is complete and has subscription
        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log('No subscription plan, redirecting to pricing');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Subscription Required",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
          return;
        }

        // All good, redirect to dashboard
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error("Error in auth callback:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try logging in again."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return null;
};