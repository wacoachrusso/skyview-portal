
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useFreeTrial(currentUserId: string | null, isOffline: boolean) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  const checkFreeTrialStatus = useCallback(async () => {
    if (!currentUserId || isOffline) return;

    try {
      console.log("Checking free trial status for user:", currentUserId);
      
      // Check for post-payment condition first
      const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
      if (isPostPayment) {
        console.log("Post-payment state detected, skipping trial status check");
        setIsTrialEnded(false);
        return;
      }
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_plan, subscription_status, query_count")
        .eq("id", currentUserId)
        .single();

      if (error) throw error;

      // Log the profile for debugging
      console.log("User profile in useFreeTrial:", profile);

      // IMPORTANT: Check for active paid subscription first
      // A user with an active status and non-free plan has full access
      if (profile?.subscription_status === 'active' && 
          (profile?.subscription_plan !== 'free' && 
           profile?.subscription_plan !== 'trial_ended')) {
        console.log("User has active subscription:", profile.subscription_plan);
        setIsTrialEnded(false);
        return;
      }

      // Check if free trial is ended
      if (profile?.subscription_plan === "free" && profile?.query_count >= 2) {
        console.log("Free trial ended - query count:", profile.query_count);
        setIsTrialEnded(true);

        // Don't redirect immediately after payment
        if (!isPostPayment) {
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue.",
            variant: "destructive",
          });
          
          // Redirect to home page with pricing section
          navigate("/?scrollTo=pricing-section", { replace: true });
        }
      } else {
        setIsTrialEnded(false);
      }
    } catch (error) {
      console.error("Error checking trial status:", error);
      setLoadError("Failed to check subscription status");
    }
  }, [currentUserId, isOffline, navigate, toast]);

  // Check trial status on component mount and when dependencies change
  useEffect(() => {
    if (currentUserId) {
      checkFreeTrialStatus();
    }
  }, [checkFreeTrialStatus, currentUserId]);

  return { checkFreeTrialStatus, loadError, isTrialEnded };
}
