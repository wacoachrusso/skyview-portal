
import { ReactNode } from "react";
import { Message } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useProfileVerification } from "@/hooks/useProfileVerification";
import { useChatAvailability } from "@/hooks/useChatAvailability";
import { TrialEndedState } from "./TrialEndedState";

interface ChatContentProps {
  messages?: Message[];
  currentUserId?: string;
  isLoading?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  onNewChat?: () => void;
  isChatDisabled?: boolean;
  children?: ReactNode;
}

export function ChatContent({
  messages = [],
  currentUserId = "",
  isLoading = false,
  onSendMessage,
  onNewChat,
  isChatDisabled = false,
  children,
}: ChatContentProps) {
  const { isOffline } = useOfflineStatus();
  const { isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const { userProfile } = useProfileVerification(currentUserId, isOffline);
  const { shouldDisableChat } = useChatAvailability(
    isChatDisabled,
    isTrialEnded,
    userProfile,
    currentUserId
  );

  // If the trial has ended or chat is disabled, show the TrialEndedState
  if (shouldDisableChat && !children) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      <ChatHeader onNewChat={onNewChat} />
      
      <div className="flex-1 overflow-hidden flex flex-col w-full">
        {children ? children : (
          <div className="flex-1 overflow-y-auto w-full">
            <p className="text-center text-muted-foreground p-4">
              Start a conversation with the AI assistant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
