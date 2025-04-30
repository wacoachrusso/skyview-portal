
import { ReactNode } from "react";
import { Message } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useProfileVerification } from "@/hooks/useProfileVerification";
import { useChatAvailability } from "@/hooks/useChatAvailability";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { TrialEndedState } from "./TrialEndedState";
interface ChatContentProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onNewChat?: () => void;
  isChatDisabled?: boolean;
  children?: ReactNode;
}

export function ChatContent({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
  onNewChat,
  isChatDisabled = false,
  children,
}: ChatContentProps) {
  const { isOffline, offlineError } = useOfflineStatus();
  const { loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const { userProfile } = useProfileVerification(currentUserId, isOffline);
  const { shouldDisableChat } = useChatAvailability(
    isChatDisabled,
    isTrialEnded,
    userProfile,
    currentUserId
  );
  const { copyToClipboard } = useCopyToClipboard();

  // If the trial has ended or chat is disabled, show the TrialEndedState
  if (shouldDisableChat) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat} />
      
      {children ? (
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      ) : (
        <div className="flex-1">
          <p className="text-center text-muted-foreground p-4">
            Start a conversation with the AI assistant.
          </p>
        </div>
      )}
    </div>
  );
}
