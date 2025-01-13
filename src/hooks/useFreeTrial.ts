import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useFreeTrial(currentUserId: string | null, isOffline: boolean) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadError, setLoadError] = useState<string | null>(null);

  const checkFreeTrialStatus = useCallback(async () => {
    if (!currentUserId || isOffline) return;

    try {
      console.log('Checking free trial status for user:', currentUserId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_plan, query_count')
        .eq('id', currentUserId)
        .single();

      if (error) throw error;

      if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
        console.log('Free trial ended, logging out user');
        await supabase.auth.signOut();
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue.",
          variant: "destructive"
        });
        navigate('/?scrollTo=pricing-section');
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
      setLoadError('Failed to check subscription status');
    }
  }, [currentUserId, isOffline, navigate, toast]);

  return { checkFreeTrialStatus, loadError };
}