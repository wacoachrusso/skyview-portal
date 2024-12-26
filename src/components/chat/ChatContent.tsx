import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types/chat";
import { WelcomeMessage } from "./WelcomeMessage";

interface ChatContentProps {
  messages: Message[];
  currentUserId: string | null;
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatContent({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
}: ChatContentProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading && <WelcomeMessage />}
        <ChatList 
          messages={messages} 
          currentUserId={currentUserId || ''} 
          isLoading={isLoading}
        />
      </div>
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
}