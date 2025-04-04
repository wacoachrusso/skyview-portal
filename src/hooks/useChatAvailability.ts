
import { useMemo, useEffect } from "react";
import { useNavigation } from "./useNavigation";

interface UserProfile {
  subscription_plan: string;
  subscription_status: string;
  query_count: number;
  is_admin?: boolean;
}

export function useChatAvailability(
  isChatDisabled: boolean, 
  isTrialEnded: boolean, 
  userProfile: UserProfile | null,
  currentUserId: string | null
) {
  const { navigateTo } = useNavigation();

  // Determine if the chat should be disabled
  const shouldDisableChat = useMemo(() => {
    // Admin users should always have access - check this first
    if (localStorage.getItem('user_is_admin') === 'true' || userProfile?.is_admin) {
      return false;
    }
    
    // Skip all checks if we're in post-payment state
    if (localStorage.getItem('subscription_activated') === 'true') {
      return false;
    }
    
    // Recent signup should not have disabled chat
    if (sessionStorage.getItem('recently_signed_up') === 'true') {
      return false;
    }
    
    return isChatDisabled || 
           isTrialEnded || 
           (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 2) ||
           (userProfile?.subscription_status === 'inactive' && userProfile?.subscription_plan !== 'free');
  }, [isChatDisabled, isTrialEnded, userProfile]);

  // Auto-redirect if trial has ended
  useEffect(() => {
    // Skip redirect if admin or in special states
    if (localStorage.getItem('user_is_admin') === 'true' || 
        userProfile?.is_admin ||
        localStorage.getItem('subscription_activated') === 'true' ||
        localStorage.getItem('login_in_progress') === 'true' ||
        localStorage.getItem('payment_in_progress') === 'true' ||
        sessionStorage.getItem('recently_signed_up') === 'true') {
      return;
    }
    
    if (shouldDisableChat && currentUserId) {
      console.log("[useChatAvailability] Chat is disabled, redirecting to pricing");
      navigateTo("/?scrollTo=pricing-section", { replace: true });
    }
  }, [shouldDisableChat, navigateTo, currentUserId, userProfile]);

  return { shouldDisableChat };
}
