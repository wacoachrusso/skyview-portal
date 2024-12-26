import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types/chat";
import { WelcomeMessage } from "./WelcomeMessage";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
      duration: 2000,
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading && <WelcomeMessage />}
        <ChatList 
          messages={messages} 
          currentUserId={currentUserId || ''} 
          isLoading={isLoading}
          onCopyMessage={handleCopyMessage}
        />
      </div>
      <div className="mt-auto border-t border-white/10 bg-[#1A1F2C]">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}