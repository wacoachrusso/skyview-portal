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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { isOffline, offlineError } = useOfflineStatus();
  const { storedMessages, setStoredMessages } = useMessageStorage(messages);
  const { checkFreeTrialStatus, loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);

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

  // Redirect to pricing if trial has ended
  useEffect(() => {
    if (isTrialEnded) {
      console.log('Trial ended, redirecting to pricing');
      navigate('/?scrollTo=pricing-section');
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000
      });
    }
  }, [isTrialEnded, navigate, toast]);

  // Memoize the display messages to prevent unnecessary recalculations
  const displayMessages = useMemo(() => 
    isOffline ? storedMessages : messages
  , [isOffline, storedMessages, messages]);

  if (isTrialEnded) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Your free trial has ended. Please select a subscription plan to continue using SkyGuide.
          </AlertDescription>
        </Alert>
        <button
          onClick={() => navigate('/?scrollTo=pricing-section')}
          className="mt-4 bg-brand-gold hover:bg-brand-gold/90 text-black px-4 py-2 rounded-md"
        >
          View Plans
        </button>
      </div>
    );
  }

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
          disabled={isOffline || isTrialEnded} 
        />
      </div>
    </div>
  );
}