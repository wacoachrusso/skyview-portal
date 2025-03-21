
import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { WelcomeMessage } from "./WelcomeMessage";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
  onSelectQuestion?: (question: string) => void;
}

export function ChatContainer({ 
  messages, 
  currentUserId, 
  isLoading, 
  onCopyMessage,
  onSelectQuestion
}: ChatContainerProps) {
  console.log('ChatContainer rendering with messages:', messages);
  
  // Only show welcome message if there are no messages and not loading
  const showWelcomeMessage = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {showWelcomeMessage ? (
        <WelcomeMessage onSelectQuestion={onSelectQuestion} />
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
