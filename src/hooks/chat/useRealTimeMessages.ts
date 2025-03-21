
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
    if (conversationId) {
      setupChannel(conversationId);
    }
  }, [conversationId, setupChannel]);
}
