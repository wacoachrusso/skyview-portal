
import { Message } from "@/types/chat";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatContainer } from "./ChatContainer";
import { OfflineAlert } from "./OfflineAlert";
import { TrialEndedState } from "./TrialEndedState";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useProfileVerification } from "@/hooks/useProfileVerification";
import { useChatAvailability } from "@/hooks/useChatAvailability";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <ChatHeader onNewChat={onNewChat} />
      
      {isOffline && <OfflineAlert offlineError={offlineError} />}
      
      <ChatContainer 
        messages={messages} 
        isLoading={isLoading} 
        currentUserId={currentUserId || ""}
        onCopyMessage={copyToClipboard}
      />
      
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading} 
        disabled={isChatDisabled}
      />
    </div>
  );
}
