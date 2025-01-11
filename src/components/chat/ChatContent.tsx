import { Message } from "@/types/chat";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { WelcomeMessage } from "./WelcomeMessage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [hasInitializedChat, setHasInitializedChat] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      setIsOffline(false);
      setOfflineError(null);
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setIsOffline(true);
    };

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
        setOfflineError('Unable to store messages for offline access');
      }
    } else {
      localStorage.removeItem('current-chat-messages');
      console.log('Cleared stored messages for new chat');
    }
  }, [messages]);

  // Check for free trial status after each message
  useEffect(() => {
    const checkFreeTrialStatus = async () => {
      if (!currentUserId) return;

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
        if (!navigator.onLine) {
          setOfflineError('Unable to verify subscription status while offline');
        }
      }
    };

    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      checkFreeTrialStatus();
    }
  }, [messages, currentUserId, navigate, toast]);

  // Load stored messages when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      if (hasInitializedChat || !currentUserId) return;

      console.log('Initializing chat for user:', currentUserId);
      try {
        const storedMessages = localStorage.getItem('current-chat-messages');
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          console.log('Found stored messages:', parsedMessages.length);
          if (messages.length === 0 && parsedMessages.length > 0) {
            console.log('Loading stored conversation');
            await onSendMessage(''); // This will trigger a reload of the conversation
          }
        }
        setHasInitializedChat(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setOfflineError('Unable to load stored messages');
      }
    };

    initializeChat();
  }, [currentUserId, messages.length, onSendMessage, hasInitializedChat]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat || (() => {})} />
      {isOffline && (
        <Alert variant="destructive" className="mb-4 mx-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some features may be limited.
            {offlineError && <div className="mt-2 text-sm">{offlineError}</div>}
          </AlertDescription>
        </Alert>
      )}
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
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
          disabled={isOffline} 
        />
      </div>
    </div>
  );
}