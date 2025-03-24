
import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { LoadingMessage } from "./LoadingMessage";
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
  isLoading = false,
  onCopyMessage,
  onSelectQuestion,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("ChatContainer rendering with messages:", messages.length);

  // Improved scroll behavior with smooth scrolling
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: 'end'
      });
    }
  };

  // Scroll down when new messages are added or loading state changes
  useEffect(() => {
    // Use immediate scroll for the first load or when user is close to bottom
    const shouldScrollImmediately = messages.length <= 3;
    scrollToBottom(shouldScrollImmediately ? 'auto' : 'smooth');
  }, [messages.length, isLoading]);

  // Separate effect to monitor content changes of streaming messages
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.map(m => m.content).join('')]);

  // Group messages by sender to create visual conversation clusters
  const renderMessages = () => {
    return messages.map((message, index) => {
      const isCurrentUser = message.user_id === currentUserId;
      // Check if this is the last message in a group from the same sender
      const isLastInGroup = 
        index === messages.length - 1 || 
        messages[index + 1]?.user_id !== message.user_id;
      
      // Check if this is a streaming message (in progress)
      const isStreaming = message.id.startsWith('streaming-');
      
      return (
        <ChatMessage
          key={message.id}
          message={message}
          isCurrentUser={isCurrentUser}
          onCopy={() => onCopyMessage(message.content)}
          isLastInGroup={isLastInGroup}
          isStreaming={isStreaming}
        />
      );
    });
  };

  // If there are no messages yet, show the welcome message
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 pt-0 space-y-4">
        <WelcomeMessage onSelectQuestion={onSelectQuestion} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full overflow-y-auto px-1 sm:px-3 py-4 pt-0 space-y-1 scroll-smooth"
    >
      {renderMessages()}
      {isLoading && !messages.some(m => m.id.startsWith('streaming-')) && <LoadingMessage />}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
