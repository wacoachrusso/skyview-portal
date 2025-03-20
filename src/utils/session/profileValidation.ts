
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

interface ValidationProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const checkProfileStatus = async (userId: string, { navigate, toast }: ValidationProps) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, query_count')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      
      navigate('/login');
      return false;
    }

    if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
      console.log('Free trial exhausted, logging out');
      
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue."
      });
      navigate('/?scrollTo=pricing-section');
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking profile:", error);
    return false;
  }
};
