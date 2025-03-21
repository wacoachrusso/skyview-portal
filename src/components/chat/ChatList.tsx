
import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useClipboard } from "@/hooks/useClipboard";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatList({ messages, currentUserId, isLoading, onCopyMessage }: ChatListProps) {
  console.log('ChatList rendering with messages:', messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { copy } = useClipboard();
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleCopyMessage = (content: string) => {
    copy(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard",
      duration: 2000,
    });
    if (onCopyMessage) {
      onCopyMessage(content);
    }
  };

  // Group messages by role to determine if a message is the last in its group
  // This would be useful for styling consecutive messages from the same sender
  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isNewGroup = !prevMessage || prevMessage.role !== message.role;
    
    if (isNewGroup) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    
    return acc;
  }, [] as Message[][]);

  return (
    <div className="flex flex-col space-y-2 p-4 overflow-y-auto">
      {groupedMessages.flatMap((group, groupIndex) => 
        group.map((message, messageIndex) => {
          const isCurrentUser = message.role === "user";
          const isLastInGroup = messageIndex === group.length - 1;
          
          return (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              onCopy={() => handleCopyMessage(message.content)}
              isLastInGroup={isLastInGroup}
            />
          );
        })
      )}
      
      {isLoading && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
