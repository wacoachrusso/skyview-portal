import { Message } from "@/types/chat";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatContainer } from "./ChatContainer";
import { useEffect, useCallback, useMemo } from "react";
import { OfflineAlert } from "./OfflineAlert";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useMessageStorage } from "@/hooks/useMessageStorage";
import { useFreeTrial } from "@/hooks/useFreeTrial";
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
  const { toast } = useToast();
  const { isOffline, offlineError } = useOfflineStatus();
  const { storedMessages, setStoredMessages } = useMessageStorage(messages);
  const { checkFreeTrialStatus, loadError } = useFreeTrial(currentUserId, isOffline);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      duration: 2000
    });
  }, [toast]);

  // Check for free trial status after each message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      checkFreeTrialStatus();
    }
  }, [messages, checkFreeTrialStatus]);

  // Store messages in localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Storing new messages:', messages.length);
      setStoredMessages(messages);
    }
  }, [messages, setStoredMessages]);

  // Log when offline status changes
  useEffect(() => {
    console.log('Offline status changed:', isOffline);
    console.log('Available stored messages:', storedMessages.length);
  }, [isOffline, storedMessages]);

  // Memoize the display messages to prevent unnecessary recalculations
  const displayMessages = useMemo(() => 
    isOffline ? storedMessages : messages
  , [isOffline, storedMessages, messages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      {isOffline && <OfflineAlert offlineError={offlineError || loadError} />}
      <ChatContainer
        messages={displayMessages}
        currentUserId={currentUserId || ''}
        isLoading={isLoading}
        onCopyMessage={handleCopyMessage}
      />
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