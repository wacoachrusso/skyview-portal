import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTrialCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkTrialStatus = async (userId: string) => {
    console.log("Checking trial status for user:", userId);
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, query_count')
      .eq('id', userId)
      .single();

    if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
      console.log('Free trial exhausted');
      await supabase.auth.signOut();
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue."
      });
      navigate('/?scrollTo=pricing-section');
      return false;
    }

    return true;
  };

  return { checkTrialStatus };
};