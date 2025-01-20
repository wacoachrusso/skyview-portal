import { useEffect, useMemo } from "react";
import { Message } from "@/types/chat";
import { useMessageStorage } from "@/hooks/useMessageStorage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useChatState(
  messages: Message[],
  isTrialEnded: boolean,
  isOffline: boolean
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { storedMessages, setStoredMessages } = useMessageStorage(messages);

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

  // Memoize the display messages
  const displayMessages = useMemo(() => 
    isOffline ? storedMessages : messages
  , [isOffline, storedMessages, messages]);

  return {
    displayMessages
  };
}