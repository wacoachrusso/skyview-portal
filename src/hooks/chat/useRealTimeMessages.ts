
import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { setupMessageChannel } from "@/utils/conversationUtils";

/**
 * Hook to manage real-time message updates via Supabase channels
 */
export function useRealTimeMessages(
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  const activeChannelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Function to setup a channel subscription with reconnection logic
  const setupChannel = useCallback(
    (conversationId: string) => {
      if (!conversationId || !isMountedRef.current) return;

      // Clean up existing channel
      if (activeChannelRef.current) {
        console.log(`Removing existing channel: ${activeChannelRef.current}`);
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }

      // Set up new real-time channel for the conversation
      const channel = setupMessageChannel(conversationId, (newMessage) => {
        if (!isMountedRef.current) return;
        
        console.log(`Received new message: ${newMessage.id}`);
        onNewMessage(newMessage);
      });

      activeChannelRef.current = channel;
    },
    [onNewMessage]
  );

  // Subscribe to real-time updates when conversation changes
  useEffect(() => {
    if (conversationId) {
      setupChannel(conversationId);
    }
  }, [conversationId, setupChannel]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeChannelRef.current) {
        console.log(`Cleaning up channel on unmount: ${activeChannelRef.current}`);
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
    };
  }, []);
}
