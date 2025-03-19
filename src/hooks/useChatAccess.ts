
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useChatAccess(currentUserId: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChatDisabled, setIsChatDisabled] = useState(false);

  const checkAccess = useCallback(async () => {
    if (!currentUserId) return;
    
    console.log("Checking access...");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No session found, redirecting to home...");
      navigate("/"); // Redirect to home if no session
      return;
    }

    // Fetch user profile to check subscription plan and query count
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_plan, query_count")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    console.log("Fetched profile:", profile);

    // Check if user is on free plan and query_count >= 1
    if (profile?.subscription_plan === "free" && profile?.query_count >= 2) {
      console.log("Free trial ended, disabling chat...");
      setIsChatDisabled(true); // Disable chat
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000,
      });
    }
  }, [currentUserId, navigate, toast]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    isChatDisabled,
    setIsChatDisabled,
    checkAccess
  };
}
