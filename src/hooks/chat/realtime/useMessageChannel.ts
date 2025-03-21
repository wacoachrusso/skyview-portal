
import { useCallback } from "react";
import { Message } from "@/types/chat";
import { setupMessageChannel } from "@/utils/conversationUtils";
import { useChannelSubscription } from "./useChannelSubscription";

/**
 * Hook to create and manage a real-time message channel
 */
export function useMessageChannel(
  onNewMessage: (message: Message) => void
) {
  const { isMounted, setActiveChannel } = useChannelSubscription();

  // Function to setup a channel subscription with reconnection logic
  const setupChannel = useCallback(
    (conversationId: string) => {
      if (!conversationId || !isMounted) return;

      console.log(`Setting up real-time channel for conversation: ${conversationId}`);
      
      // Set up new real-time channel for the conversation
      const channel = setupMessageChannel(conversationId, (newMessage) => {
        if (!isMounted) return;
        
        console.log(`Received new message: ${newMessage.id}`);
        onNewMessage(newMessage);
      });

      setActiveChannel(channel);
    },
    [onNewMessage, isMounted, setActiveChannel]
  );

  return { setupChannel };
}
