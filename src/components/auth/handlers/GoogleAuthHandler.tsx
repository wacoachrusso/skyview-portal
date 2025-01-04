import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Handling Google auth callback');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem with your session."
        });
        navigate('/login');
        return;
      }

      if (!session?.user) {
        console.log('No session found');
        navigate('/login');
        return;
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
          variant: "destructive",
          title: "Account Required",
          description: "Please sign up and select a plan before logging in with Google."
        });
        navigate('/?scrollTo=pricing-section');
        return;
      }

      // Check if account is active and has valid subscription
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

      console.log('Auth callback successful, redirecting to dashboard');
      navigate('/dashboard');
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return null;
};