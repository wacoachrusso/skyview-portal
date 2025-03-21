
import { Message } from "@/types/chat";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatContainer } from "./ChatContainer";
import { OfflineAlert } from "./OfflineAlert";
import { TrialEndedState } from "./TrialEndedState";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ChatContentProps {
  messages: Message[];
  currentUserId: string | null;
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onNewChat?: () => void;
  isChatDisabled?: boolean;
}

export function ChatContent({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
  onNewChat,
  isChatDisabled = false,
}: ChatContentProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOffline, offlineError } = useOfflineStatus();
  const { loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const [userProfile, setUserProfile] = useState<{
    subscription_plan: string;
    subscription_status: string;
    query_count: number;
  } | null>(null);

  // Fetch user profile from the database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUserId) return;

      try {
        // Check for post-payment condition first
        const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
        
        if (isPostPayment) {
          console.log("ChatContent: Post-payment state detected, ensuring status updated");
          
          // Delay this process slightly to ensure we have a valid session
          setTimeout(async () => {
            // Update user profile to mark subscription as active
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                subscription_status: 'active',
                subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
              })
              .eq('id', currentUserId);
              
            if (updateError) {
              console.error("ChatContent: Error updating profile after payment:", updateError);
            } else {
              console.log("ChatContent: Profile updated with active subscription");
            }
          }, 1000);
          
          // Don't clear post-payment flags yet - they're needed elsewhere
        }

        // Fetch the profile regardless of payment state
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_plan, subscription_status, query_count")
          .eq("id", currentUserId)
          .single();

        if (error) throw error;

        console.log("ChatContent: User profile:", profile);
        setUserProfile(profile);
        
        // Only check for free trial end if:
        // 1. Not in post-payment state
        // 2. No login in progress
        // 3. Not on homepage already
        if (!isPostPayment && 
            !localStorage.getItem('login_in_progress') && 
            (profile.subscription_plan === "free" && profile.query_count >= 2) && 
            window.location.pathname !== '/') {
          console.log("ChatContent: Free trial ended - redirecting to pricing");
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue.",
            variant: "destructive",
          });
          // Clear temporary flags now that we're redirecting
          localStorage.removeItem('login_in_progress');
          navigate("/?scrollTo=pricing-section", { replace: true });
        }
        
        // Only when we know we're staying on this page and everything is good,
        // we can clear the post-payment state
        if (isPostPayment && 
            profile.subscription_status === 'active' && 
            profile.subscription_plan !== 'free' &&
            window.location.pathname === '/chat') {
          // Clear payment flags after a delay to ensure other components have processed them
          setTimeout(() => {
            console.log("ChatContent: All good, clearing payment flags after 3 seconds");
            localStorage.removeItem('subscription_activated');
            localStorage.removeItem('selected_plan');
            localStorage.removeItem('payment_in_progress');
            localStorage.removeItem('login_in_progress');
          }, 3000);
        }
      } catch (error) {
        console.error("ChatContent: Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
    
    // Set up a timer to clear flags after 1 minute as a fallback
    const safetyClearTimeout = setTimeout(() => {
      if (localStorage.getItem('subscription_activated') === 'true' &&
          window.location.pathname === '/chat') {
        console.log("ChatContent: Safety timeout clearing payment flags");
        localStorage.removeItem('subscription_activated');
        localStorage.removeItem('selected_plan');
        localStorage.removeItem('payment_in_progress');
        localStorage.removeItem('login_in_progress');
      }
    }, 60000); // 1 minute safety timeout
    
    return () => clearTimeout(safetyClearTimeout);
    
  }, [currentUserId, navigate, toast]);

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

  // Memoize the display messages
  const displayMessages = useMemo(() => 
    isOffline ? messages : messages
  , [isOffline, messages]);

  // Auto-redirect if trial has ended
  useEffect(() => {
    // Skip redirect if in post-payment state
    if (localStorage.getItem('subscription_activated') === 'true' ||
        localStorage.getItem('login_in_progress') === 'true') {
      return;
    }
    
    if (shouldDisableChat && currentUserId) {
      console.log("ChatContent: Chat is disabled, redirecting to pricing");
      navigate("/?scrollTo=pricing-section", { replace: true });
    }
  }, [shouldDisableChat, navigate, currentUserId]);

  // If the trial has ended or chat is disabled, show the TrialEndedState
  if (shouldDisableChat) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} isLoading={isLoading} />
      {isOffline && <OfflineAlert offlineError={offlineError || loadError} />}
      <ChatContainer
        messages={displayMessages}
        currentUserId={currentUserId || ""}
        isLoading={isLoading}
        onCopyMessage={(content) => {
          navigator.clipboard.writeText(content);
        }}
      />
      <div className="flex-shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          disabled={isOffline || shouldDisableChat}
          queryCount={userProfile?.query_count || 0}
          subscriptionPlan={userProfile?.subscription_plan || "free"}
        />
      </div>
    </div>
  );
}
