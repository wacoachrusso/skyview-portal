
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
      
      // CRITICAL: Check for post-payment condition early and skip all checks
      const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
      if (isPostPayment) {
        console.log("Post-payment state detected in useFreeTrial, bypassing all checks");
        setIsTrialEnded(false);
        
        // Ensure profile is updated one more time (redundancy)
        try {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              subscription_status: 'active',
              subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
            })
            .eq("id", currentUserId);
            
          if (updateError) {
            console.error("Error in redundant profile update:", updateError);
          } else {
            console.log("Profile confirmed updated in useFreeTrial");
          }
        } catch (e) {
          console.error("Non-critical error in profile update:", e);
        }
        
        return;
      }
      
      // Now proceed with regular checks
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_plan, subscription_status, query_count")
        .eq("id", currentUserId)
        .single();

      if (error) throw error;

      // Log the profile for debugging
      console.log("User profile in useFreeTrial:", profile);

      // IMPORTANT: Check for active paid subscription first
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

        // Only redirect if not immediately after login or payment
        const skipRedirect = localStorage.getItem('login_in_progress') === 'true' || 
                             localStorage.getItem('payment_in_progress') === 'true' ||
                             localStorage.getItem('subscription_activated') === 'true';
                             
        if (!skipRedirect) {
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue.",
            variant: "destructive",
          });
          
          // Redirect to pricing section
          console.log("Redirecting to pricing section from useFreeTrial");
          navigate("/?scrollTo=pricing-section", { replace: true });
        } else {
          console.log("Skipping redirect due to login/payment in progress");
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
