import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeMessage } from "./WelcomeMessage";
import { useEffect } from "react";

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

  // Store messages in localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Storing messages in chat history:', messages.length, 'messages');
      try {
        const chatHistory = JSON.parse(localStorage.getItem('chat-history') || '[]');
        const lastMessage = messages[messages.length - 1];
        
        // Only add to history if it's a new message
        if (!chatHistory.some((msg: Message) => msg.id === lastMessage.id)) {
          chatHistory.push(lastMessage);
          localStorage.setItem('chat-history', JSON.stringify(chatHistory));
          console.log('Added new message to chat history');
        }
      } catch (error) {
        console.error('Error storing messages in chat history:', error);
      }
    }
  }, [messages]);

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