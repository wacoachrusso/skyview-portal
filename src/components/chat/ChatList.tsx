
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatList({ messages, currentUserId, isLoading, onCopyMessage }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only auto-scroll if there are new messages
    const shouldAutoScroll = messages.length > previousMessagesLengthRef.current;
    
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
      <ScrollArea className="flex-1 pb-20">
        <div className="flex flex-col gap-3 p-3 sm:p-5">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.user_id === currentUserId}
              onCopy={() => onCopyMessage(message.content)}
            />
          ))}
          
          {isLoading && (
            <div className="flex w-full gap-2 p-2 justify-start animate-fade-in">
              <div className="flex max-w-[80%] flex-col gap-1 rounded-xl px-3 py-2 sm:px-4 sm:py-2 bg-chat-ai-gradient text-white border border-white/5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="animate-pulse w-2 h-2 bg-brand-gold rounded-full"></div>
                    <div className="animate-pulse w-2 h-2 bg-brand-gold rounded-full delay-150"></div>
                    <div className="animate-pulse w-2 h-2 bg-brand-gold rounded-full delay-300"></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-300">Searching the contract...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
