
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
      if (!conversationId) {
        console.warn("Cannot setup channel: Missing conversation ID");
        return;
      }
      
      if (!isMounted) {
        console.warn("Cannot setup channel: Component unmounted");
        return;
      }

      console.log(`Setting up real-time channel for conversation: ${conversationId}`);
      
      try {
        // Set up new real-time channel for the conversation
        const channel = setupMessageChannel(conversationId, (newMessage) => {
          if (!isMounted) {
            console.warn("Message received, but component unmounted");
            return;
          }
          
          console.log(`Received new message in conversation ${conversationId}: ${newMessage.id}`);
          onNewMessage(newMessage);
        });

        if (channel) {
          setActiveChannel(channel);
          console.log(`Channel successfully established for conversation: ${conversationId}`);
        } else {
          console.error("Failed to create channel - setupMessageChannel returned null or undefined");
        }
      } catch (error) {
        console.error(`Error setting up message channel for conversation ${conversationId}:`, error);
      }
    },
    [onNewMessage, isMounted, setActiveChannel]
  );

  return { setupChannel };
}
