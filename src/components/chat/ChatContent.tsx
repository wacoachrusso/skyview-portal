import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeMessage } from "./WelcomeMessage";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineMessages, setOfflineMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Load offline messages when offline
  useEffect(() => {
    if (isOffline) {
      try {
        const currentConversationId = localStorage.getItem('current-conversation-id');
        if (currentConversationId) {
          const storedMessages = localStorage.getItem(`offline-chat-${currentConversationId}`);
          if (storedMessages) {
            const parsedMessages = JSON.parse(storedMessages);
            console.log('Loaded offline messages:', parsedMessages.length, 'messages');
            setOfflineMessages(parsedMessages);
          } else {
            toast({
              title: "Chat not available offline",
              description: "This chat hasn't been saved for offline viewing",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error loading offline messages:', error);
        toast({
          title: "Error loading chat",
          description: "Unable to load offline messages",
          variant: "destructive"
        });
      }
    }
  }, [isOffline, toast]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <ChatList
            messages={isOffline ? offlineMessages : messages}
            currentUserId={currentUserId || ''}
            isLoading={isLoading}
            onCopyMessage={handleCopyMessage}
          />
        )}
      </div>
      <div className="flex-shrink-0">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading} 
          disabled={isOffline}
        />
      </div>
    </div>
  );
}