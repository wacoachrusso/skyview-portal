import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { WelcomeMessage } from "./WelcomeMessage";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatContainer({ 
  messages, 
  currentUserId, 
  isLoading, 
  onCopyMessage 
}: ChatContainerProps) {
  // Only show welcome message if there are no messages and not loading
  const showWelcomeMessage = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 overflow-y-auto">
      {showWelcomeMessage ? (
        <WelcomeMessage />
      ) : (
        <ChatList
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
          onCopyMessage={onCopyMessage}
        />
      )}
    </div>
  );
}