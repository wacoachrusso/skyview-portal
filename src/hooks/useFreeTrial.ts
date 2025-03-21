
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
      console.log("[useFreeTrial] Checking free trial status for user:", currentUserId);
      
      // CRITICAL: Check for post-payment condition early and skip all checks
      // This is the most important condition - if we're in post-payment state, 
      // we MUST bypass all trial/subscription checks
      const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
      if (isPostPayment) {
        console.log("[useFreeTrial] Post-payment state detected, bypassing ALL checks");
        setIsTrialEnded(false);
        
        // Ensure profile is updated with active subscription status
        try {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              subscription_status: 'active',
              subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
            })
            .eq("id", currentUserId);
            
          if (updateError) {
            console.error("[useFreeTrial] Error updating profile:", updateError);
          } else {
            console.log("[useFreeTrial] Profile updated with active subscription");
          }
        } catch (e) {
          console.error("[useFreeTrial] Non-critical error in profile update:", e);
        }
        
        return;
      }
      
      // Only if we're not in post-payment state, proceed with regular checks
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_plan, subscription_status, query_count")
        .eq("id", currentUserId)
        .single();

      if (error) {
        console.error("[useFreeTrial] Error fetching profile:", error);
        throw error;
      }

      console.log("[useFreeTrial] User profile:", profile);

      // CRITICAL: Check for active paid subscription first
      // This is the second most important condition
      if (profile?.subscription_status === 'active' && 
          (profile?.subscription_plan !== 'free' && 
           profile?.subscription_plan !== 'trial_ended')) {
        console.log("[useFreeTrial] User has active subscription:", profile.subscription_plan);
        setIsTrialEnded(false);
        return;
      }

      // Only if not on active paid plan, check free trial status
      if (profile?.subscription_plan === "free" && profile?.query_count >= 2) {
        console.log("[useFreeTrial] Free trial ended - query count:", profile.query_count);
        setIsTrialEnded(true);

        // Only redirect if not in special states to prevent redirect loops
        const skipRedirect = 
          localStorage.getItem('login_in_progress') === 'true' || 
          localStorage.getItem('payment_in_progress') === 'true' ||
          localStorage.getItem('subscription_activated') === 'true';
                             
        if (!skipRedirect) {
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue.",
            variant: "destructive",
          });
          
          console.log("[useFreeTrial] Redirecting to pricing section");
          navigate("/?scrollTo=pricing-section", { replace: true });
        } else {
          console.log("[useFreeTrial] Skipping redirect due to special state flags");
        }
      } else {
        setIsTrialEnded(false);
      }
    } catch (error) {
      console.error("[useFreeTrial] Error checking trial status:", error);
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
