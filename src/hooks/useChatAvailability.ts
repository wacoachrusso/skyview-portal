
import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  subscription_plan: string;
  subscription_status: string;
  query_count: number;
}

export function useChatAvailability(
  isChatDisabled: boolean, 
  isTrialEnded: boolean, 
  userProfile: UserProfile | null,
  currentUserId: string | null
) {
  const navigate = useNavigate();

  // Determine if the chat should be disabled
  const shouldDisableChat = useMemo(() => {
    // Skip all checks if we're in post-payment state
    if (localStorage.getItem('subscription_activated') === 'true') {
      return false;
    }
    
    return isChatDisabled || 
           isTrialEnded || 
           (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 2) ||
           (userProfile?.subscription_status === 'inactive' && userProfile?.subscription_plan !== 'free');
  }, [isChatDisabled, isTrialEnded, userProfile]);

  // Auto-redirect if trial has ended
  useEffect(() => {
    // Skip redirect if in special states
    if (localStorage.getItem('subscription_activated') === 'true' ||
        localStorage.getItem('login_in_progress') === 'true' ||
        localStorage.getItem('payment_in_progress') === 'true') {
      return;
    }
    
    if (shouldDisableChat && currentUserId) {
      console.log("[useChatAvailability] Chat is disabled, redirecting to pricing");
      navigate("/?scrollTo=pricing-section", { replace: true });
    }
  }, [shouldDisableChat, navigate, currentUserId]);

  return { shouldDisableChat };
}
