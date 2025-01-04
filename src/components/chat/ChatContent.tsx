import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeMessage } from "./WelcomeMessage";

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
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <ChatList
            messages={messages}
            currentUserId={currentUserId || ''}
            isLoading={isLoading}
            onCopyMessage={handleCopyMessage}
          />
        )}
      </div>
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}