
import { ReactNode } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatHeader } from "./ChatHeader";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useProfileVerification } from "@/hooks/useProfileVerification";
import { useChatAvailability } from "@/hooks/useChatAvailability";
import { TrialEndedState } from "./TrialEndedState";
import { Message } from "@/types/chat";

interface ChatContentProps {
  messages?: Message[];
  currentUserId?: string;
  isLoading?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  onNewChat?: () => void;
  isChatDisabled?: boolean;
  children?: ReactNode;
  error?: Error | null;
  showWelcome?: boolean;
  currentConversationId?: string | null;
}

export function ChatContent({
  messages = [],
  currentUserId = "",
  isLoading = false,
  onSendMessage,
  onNewChat,
  isChatDisabled = false,
  children,
  error,
  showWelcome,
  currentConversationId
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
          <div className="flex-1 overflow-y-auto w-full p-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender_id === currentUserId}
                    onCopy={() => navigator.clipboard.writeText(message.content || "")}
                  />
                ))}
                {isLoading && <p className="text-center text-muted-foreground">Loading messages...</p>}
              </div>
            ) : showWelcome ? (
              <p className="text-center text-muted-foreground">
                Start a conversation with the AI assistant.
              </p>
            ) : isLoading ? (
              <p className="text-center text-muted-foreground">Loading messages...</p>
            ) : (
              <p className="text-center text-muted-foreground">No messages in this conversation yet.</p>
            )}
            
            {error && (
              <p className="text-center text-red-500 mt-4">
                Error: {error.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
