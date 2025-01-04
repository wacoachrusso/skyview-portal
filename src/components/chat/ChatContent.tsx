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
        localStorage.setItem('current-chat-messages', JSON.stringify(messages));
        console.log('Stored current chat messages in localStorage');
      } catch (error) {
        console.error('Error storing messages in localStorage:', error);
      }
    } else {
      // Clear stored messages when starting a new chat
      localStorage.removeItem('current-chat-messages');
      console.log('Cleared stored messages for new chat');
    }
  }, [messages]);

  // Load stored messages when component mounts
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('current-chat-messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        console.log('Loaded stored messages:', parsedMessages.length, 'messages');
        // Only set messages if we don't already have messages (prevents overwriting new chat)
        if (messages.length === 0) {
          onSendMessage(''); // This will trigger a reload of the conversation
        }
      }
    } catch (error) {
      console.error('Error loading stored messages:', error);
    }
  }, []);

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