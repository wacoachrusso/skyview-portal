
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
          console.log("Post-payment state detected in ChatContent, ensuring status is updated");
          
          // Update user profile to mark subscription as active
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
            })
            .eq('id', currentUserId);
            
          if (updateError) {
            console.error("Error updating profile after payment:", updateError);
          } else {
            console.log("Profile updated with active subscription in ChatContent");
          }
          
          // Clear payment flags regardless of outcome to avoid loops
          setTimeout(() => {
            localStorage.removeItem('subscription_activated');
            localStorage.removeItem('selected_plan');
            localStorage.removeItem('payment_in_progress');
          }, 1000);
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_plan, subscription_status, query_count")
          .eq("id", currentUserId)
          .single();

        if (error) throw error;

        console.log("User profile in ChatContent:", profile);
        setUserProfile(profile);
        
        // IMPORTANT: Only check for free trial end or inactive subscription if not in post-payment state
        if (!isPostPayment) {
          // Clear post-payment flags if they exist to avoid confusion
          localStorage.removeItem('subscription_activated');
          localStorage.removeItem('selected_plan');
          localStorage.removeItem('payment_in_progress');
          
          // If user is on free plan and has reached the limit, redirect to pricing
          if ((profile.subscription_plan === "free" && profile.query_count >= 2) || 
              (profile.subscription_status === 'inactive' && profile.subscription_plan !== 'free')) {
            console.log("Free trial ended or inactive subscription in ChatContent - redirecting");
            toast({
              title: "Subscription Required",
              description: "Please select a subscription plan to continue.",
              variant: "destructive",
            });
            navigate("/?scrollTo=pricing-section", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
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
    if (localStorage.getItem('subscription_activated') === 'true') {
      return;
    }
    
    if (shouldDisableChat && currentUserId) {
      console.log("Chat is disabled, redirecting to pricing");
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
