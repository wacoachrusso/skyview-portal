
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
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_plan, query_count")
        .eq("id", currentUserId)
        .single();

      if (error) throw error;

      if (profile?.subscription_plan === "free" && profile?.query_count >= 2) {
        console.log("Free trial ended - query count:", profile.query_count);
        setIsTrialEnded(true);

        // Immediately redirect to pricing section when trial has ended
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue.",
          variant: "destructive",
        });
        
        // Redirect to home page with pricing section
        navigate("/?scrollTo=pricing-section", { replace: true });
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
