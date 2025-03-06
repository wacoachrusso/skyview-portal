import { Message } from "@/types/chat";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatContainer } from "./ChatContainer";
import { OfflineAlert } from "./OfflineAlert";
import { TrialEndedState } from "./TrialEndedState";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useChatState } from "@/hooks/useChatState";

interface ChatContentProps {
  messages: Message[];
  currentUserId: string | null;
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onNewChat?: () => void;
  hasReachedQueryLimit: boolean; // Add this prop
}

export function ChatContent({ 
  messages, 
  currentUserId, 
  isLoading, 
  onSendMessage,
  onNewChat,
  hasReachedQueryLimit, // Destructure the new prop
}: ChatContentProps) {
  const { isOffline, offlineError } = useOfflineStatus();
  const { loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const { displayMessages } = useChatState(messages, isTrialEnded, isOffline);

  // If the trial has ended or the query limit is reached, show the TrialEndedState
  if (isTrialEnded || hasReachedQueryLimit) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader onNewChat={onNewChat || (() => {})} />

      {/* Offline Alert */}
      {isOffline && <OfflineAlert offlineError={offlineError || loadError} />}

      {/* Chat Container */}
      <ChatContainer
        messages={displayMessages}
        currentUserId={currentUserId || ''}
        isLoading={isLoading}
        onCopyMessage={(content) => {
          navigator.clipboard.writeText(content);
        }}
      />

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
          disabled={isOffline || isTrialEnded || hasReachedQueryLimit} // Disable input if offline, trial ended, or query limit reached
        />
      </div>
    </div>
  );
}