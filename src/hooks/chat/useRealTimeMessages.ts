import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";

/**
 * Hook to subscribe to real-time message updates for a conversation
 */
export function useRealTimeMessages(
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) {
  const channelRef = useRef<any>(null);
  const prevConversationId = useRef<string | null>(null);
  
  // Clean up function for channel
  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log(`Cleaning up channel for conversation: ${prevConversationId.current}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
  
  // Set up a channel subscription when conversation ID changes
  useEffect(() => {
    // If no conversation ID, clean up and return
    if (!conversationId) {
      cleanupChannel();
      prevConversationId.current = null;
      return;
    }
    
    // Skip if we're already subscribed to this conversation
    if (conversationId === prevConversationId.current && channelRef.current) {
      console.log(`Already subscribed to conversation: ${conversationId}`);
      return;
    }
    
    // Clean up previous channel if one exists
    cleanupChannel();
    
    console.log(`Setting up real-time messages for conversation: ${conversationId}`);
    
    // Subscribe to changes on the messages table for this conversation
    try {
      channelRef.current = supabase
        .channel(`messages:conversation=${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            console.log(`New message received in conversation ${conversationId}:`, payload);
            const newMessage = payload.new as Message;
            onNewMessage(newMessage);
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for conversation ${conversationId}:`, status);
        });
        
      prevConversationId.current = conversationId;
    } catch (error) {
      console.error(`Error setting up real-time subscription for conversation ${conversationId}:`, error);
    }
    
    // Clean up subscription on unmount or when conversation changes
    return cleanupChannel;
  }, [conversationId, onNewMessage]);
}