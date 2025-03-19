
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatList({ messages, currentUserId, isLoading, onCopyMessage }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    // Determine if we should auto-scroll
    const shouldAutoScroll = 
      // Auto-scroll if there are new messages
      messages.length > previousMessagesLengthRef.current ||
      // Or if we're at the bottom already (within 100px)
      (containerRef.current && 
       containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight < 100);
    
    if (shouldAutoScroll && messages.length > 0) {
      // Use instant scroll for initial load and smooth for new messages
      const behavior = previousMessagesLengthRef.current === 0 ? "auto" : "smooth";
      scrollToBottom(behavior);
    }
    
    // Update the previous messages length reference
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto overscroll-contain touch-pan-y pb-20"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex flex-col gap-2 p-2 sm:p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.user_id === currentUserId}
              onCopy={() => onCopyMessage(message.content)}
            />
          ))}
          {isLoading && (
            <div className="flex w-full gap-2 p-2 justify-start">
              <div className="flex max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-white/5 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full delay-150"></div>
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full delay-300"></div>
                  <span className="text-xs sm:text-sm ml-2">Searching the contract...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
