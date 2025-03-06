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
}

export function ChatContent({ 
  messages, 
  currentUserId, 
  isLoading, 
  onSendMessage,
  onNewChat 
}: ChatContentProps) {
  const { isOffline, offlineError } = useOfflineStatus();
  const { loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const { displayMessages } = useChatState(messages, isTrialEnded, isOffline);

  if (isTrialEnded) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      {isOffline && <OfflineAlert offlineError={offlineError || loadError} />}
      <ChatContainer
        messages={displayMessages}
        currentUserId={currentUserId || ''}
        isLoading={isLoading}
        onCopyMessage={(content) => {
          navigator.clipboard.writeText(content);
        }}
      />
      <div className="flex-shrink-0">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
          disabled={isOffline || isTrialEnded} 
        />
      </div>
    </div>
  );
}
