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
  const showWelcomeMessage = !isLoading && messages.length === 0;

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