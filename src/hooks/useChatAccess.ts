
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useChatAccess(currentUserId: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  const checkAccess = useCallback(async () => {
    if (!currentUserId) return;
    
    console.log("Checking chat access...");

    // Skip check for newly signed up users
    if (sessionStorage.getItem('recently_signed_up') === 'true') {
      console.log("Recently signed up user, skipping access check");
      return;
    }

    // Skip check for admin users
    if (localStorage.getItem('user_is_admin') === 'true') {
      console.log("Admin user, skipping access check");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No session found, redirecting to home...");
      navigate("/"); // Redirect to home if no session
      return;
    }

    // Fetch user profile to check subscription plan and query count
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_plan, query_count, subscription_status")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    console.log("Fetched profile:", profile);

    // Check if user is on free plan and query_count >= 2 or subscription is inactive
    if (
      (profile?.subscription_plan === "free" && profile?.query_count >= 2) ||
      profile?.subscription_status === "inactive" ||
      profile?.subscription_plan === "trial_ended"
    ) {
      console.log("Free trial ended or subscription inactive");
      setIsChatDisabled(true);
      setIsTrialEnded(true);
      
      // Redirect to pricing section
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000,
      });
      
      navigate("/?scrollTo=pricing-section", { replace: true });
    }
  }, [currentUserId, navigate, toast]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    isChatDisabled,
    isTrialEnded,
    setIsChatDisabled,
    checkAccess
  };
}
