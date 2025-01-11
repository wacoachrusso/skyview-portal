import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeMessage } from "./WelcomeMessage";
import { useEffect } from "react";
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
  const { storedMessages } = useMessageStorage(messages);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Check for free trial status after each message
  useEffect(() => {
    const checkFreeTrialStatus = async () => {
      if (!currentUserId || isOffline) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count')
          .eq('id', currentUserId)
          .single();

        if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
          console.log('Free trial ended, logging out user');
          await supabase.auth.signOut();
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue."
          });
          navigate('/?scrollTo=pricing-section');
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
      }
    };

    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      checkFreeTrialStatus();
    }
  }, [messages, currentUserId, navigate, toast, isOffline]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      {isOffline && <OfflineAlert offlineError={offlineError} />}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && storedMessages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <ChatList
            messages={isOffline ? storedMessages : messages}
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