
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
    
    // IMPORTANT: Check for admin or post-payment state
    if (localStorage.getItem('user_is_admin') === 'true' || 
        localStorage.getItem('subscription_activated') === 'true') {
      console.log("Admin or post-payment user detected, enabling chat");
      setIsChatDisabled(false);
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
      .select("subscription_plan, query_count, is_admin")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    console.log("Fetched profile:", profile);
    
    // Admin users always have access
    if (profile?.is_admin) {
      console.log("Admin user detected, enabling chat");
      setIsChatDisabled(false);
      localStorage.setItem('user_is_admin', 'true');
      return;
    } else {
      localStorage.removeItem('user_is_admin');
    }

    // Check if user is on free plan and query_count >= 2
    if (profile?.subscription_plan === "free" && profile?.query_count >= 2) {
      console.log("Free trial ended, redirecting...");
      
      // Don't disable chat immediately, just redirect
      navigate("/?scrollTo=pricing-section", { replace: true });
      
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000,
      });
    } else {
      // Ensure chat is enabled for valid users
      console.log("User has valid access, enabling chat");
      setIsChatDisabled(false);
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
