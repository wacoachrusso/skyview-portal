import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeMessage } from "./WelcomeMessage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { OfflineAlert } from "./OfflineAlert";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useMessageStorage } from "@/hooks/useMessageStorage";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOffline, offlineError } = useOfflineStatus();
  const { storedMessages, setStoredMessages } = useMessageStorage(messages);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      duration: 2000
    });
  };

  // Check for free trial status after each message
  useEffect(() => {
    const checkFreeTrialStatus = async () => {
      if (!currentUserId || isOffline) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count')
          .eq('id', currentUserId)
          .single();

        if (error) throw error;

        if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
          console.log('Free trial ended, logging out user');
          await supabase.auth.signOut();
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue.",
            variant: "destructive"
          });
          navigate('/?scrollTo=pricing-section');
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
        setLoadError('Failed to check subscription status');
      }
    };

    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      checkFreeTrialStatus();
    }
  }, [messages, currentUserId, navigate, toast, isOffline]);

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

  const displayMessages = isOffline ? storedMessages : messages;
  const showWelcomeMessage = !isLoading && displayMessages.length === 0;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      {isOffline && <OfflineAlert offlineError={offlineError || loadError} />}
      <div className="flex-1 overflow-y-auto">
        {showWelcomeMessage ? (
          <WelcomeMessage />
        ) : (
          <ChatList
            messages={displayMessages}
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