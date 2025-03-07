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
  const { isOffline, offlineError } = useOfflineStatus();
  const { loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const [userProfile, setUserProfile] = useState<{
    subscription_plan: string;
    query_count: number;
  } | null>(null);

  // Fetch user profile from the database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUserId) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_plan, query_count")
          .eq("id", currentUserId)
          .single();

        if (error) throw error;

        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [currentUserId]);

  // Determine if the chat should be disabled
  const shouldDisableChat = useMemo(() => {
    return isChatDisabled || 
           isTrialEnded || 
           (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 1);
  }, [isChatDisabled, isTrialEnded, userProfile]);

  // Memoize the display messages
  const displayMessages = useMemo(() => 
    isOffline ? messages : messages // You might have stored offline messages here
  , [isOffline, messages]);

  // If the trial has ended or chat is disabled, show the TrialEndedState
  if (shouldDisableChat) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
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
          queryCount={userProfile?.query_count || 0} // Pass queryCount
          subscriptionPlan={userProfile?.subscription_plan || "free"} // Pass subscriptionPlan
        />
      </div>
    </div>
  );
}