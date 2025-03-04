import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { useMessageOperations } from "./useMessageOperations";
import { useUserProfile } from "./useUserProfile";
import { Message } from "@/types/chat";

export function useChat() {
  const { toast } = useToast();
  const { currentUserId, userProfile } = useUserProfile();
  const {
    currentConversationId,
    createNewConversation,
    ensureConversation,
    loadConversation,
    setCurrentConversationId,
  } = useConversation();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    insertUserMessage,
    insertAIMessage,
    loadMessages,
  } = useMessageOperations(currentUserId, currentConversationId);

  const activeChannelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Get a stable channel name
  const getChannelName = useCallback((conversationId: string) => {
    return `messages_${conversationId}`;
  }, []);

  // Function to setup a channel subscription
  const setupChannel = useCallback((conversationId: string) => {
    if (!conversationId || !isMountedRef.current) return;

    // Clean up existing channel
    if (activeChannelRef.current) {
      console.log(`Removing existing channel: ${activeChannelRef.current}`);
      supabase.removeChannel(activeChannelRef.current);
      activeChannelRef.current = null;
    }

    const channelName = getChannelName(conversationId);
    console.log(`Setting up new channel: ${channelName}`);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages", 
          filter: `conversation_id=eq.${conversationId}` 
        },
        (payload) => {
          if (!isMountedRef.current) return;

          if (!payload?.new) {
            console.warn("Received payload without 'new' data:", payload);
            return;
          }

          const newMessage = payload.new as Message;
          console.log(`Received new message: ${newMessage.id}`);

          // Check for duplicates before adding to state
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            return exists ? prev : [...prev, newMessage];
          });
        }
      )
      .subscribe((status, err) => {
        console.log(`Channel ${channelName} status: ${status}`);
        if (err) console.error(`Subscription error:`, err);
      });

    activeChannelRef.current = channel;
  }, [getChannelName, setMessages]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "Unable to send message. Please try refreshing the page.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      if (isLoading) return;

      setIsLoading(true);

      try {
        // Ensure the conversation exists
        const conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error('Failed to create or get conversation');
        }

        // Insert the user message
        await insertUserMessage(content, conversationId);

        // Call the AI completion function
        const { data, error } = await supabase.functions.invoke('chat-completion', {
          body: {
            content: `${content}`,
            subscriptionPlan: userProfile?.subscription_plan || 'free',
          },
        });

        if (error) throw error;
        if (!data || !data.response) throw new Error('Invalid response from chat-completion');

        // Insert the AI response
        await insertAIMessage(data.response, conversationId);
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, ensureConversation, insertUserMessage, insertAIMessage, userProfile, toast, isLoading]
  );

  // Start a new chat
  const startNewChat = useCallback(async () => {
    try {
      setMessages([]);
      setIsLoading(false);
      setCurrentConversationId(null);

      if (currentUserId) {
        const newConversationId = await createNewConversation(currentUserId);
        if (newConversationId) {
          setCurrentConversationId(newConversationId);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new chat. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, [createNewConversation, currentUserId, setCurrentConversationId, setMessages, setIsLoading, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentConversationId) return;

    setupChannel(currentConversationId);

    return () => {
      if (activeChannelRef.current) {
        console.log(`Cleaning up channel: ${activeChannelRef.current}`);
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
    };
  }, [currentConversationId, setupChannel]);

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

  return {
    messages,
    currentUserId,
    isLoading,
    sendMessage,
    createNewConversation,
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    userProfile,
    startNewChat,
  };
}