
import { useEffect } from "react";
import { Message } from "@/types/chat";
import { useMessageChannel } from "./realtime/useMessageChannel";

/**
 * Hook to manage real-time message updates via Supabase channels
 */
export function useRealTimeMessages(
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  const { setupChannel } = useMessageChannel(onNewMessage);

  // Subscribe to real-time updates when conversation changes
  useEffect(() => {
    console.log(`useRealTimeMessages: conversation changed to ${conversationId}`);
    
    if (conversationId) {
      console.log(`Setting up channel for conversation: ${conversationId}`);
      setupChannel(conversationId);
    } else {
      console.log("No conversation ID available, skipping channel setup");
    }
    
    // Effect cleanup does not need to do anything special here as
    // the useChannelSubscription hook handles cleaning up the channel
  }, [conversationId, setupChannel]);
}
