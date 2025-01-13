import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { useMessageOperations } from "./useMessageOperations";
import { useUserProfile } from "./useUserProfile";
import { useAssistantId } from "@/components/account/form-fields/AssistantIdHandler";

export function useChat() {
  const { toast } = useToast();
  const { currentUserId, userProfile } = useUserProfile();
  const { data: assistantId, error: assistantError } = useAssistantId();
  const { 
    currentConversationId, 
    createNewConversation, 
    ensureConversation,
    loadConversation, 
    setCurrentConversationId 
  } = useConversation();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    insertUserMessage,
    insertAIMessage,
    loadMessages
  } = useMessageOperations(currentUserId, currentConversationId);

  const cleanup = useCallback(() => {
    console.log('Cleaning up chat state');
    setMessages([]);
    setCurrentConversationId(null);
    setIsLoading(false);
  }, []);

  const startNewChat = useCallback(async () => {
    console.log('Starting new chat');
    cleanup();
    const newConversationId = await createNewConversation(currentUserId!);
    if (newConversationId) {
      setCurrentConversationId(newConversationId);
    }
  }, [currentUserId, cleanup, createNewConversation, setCurrentConversationId]);

  const sendMessage = async (content: string) => {
    console.log('Sending message:', { content, conversationId: currentConversationId });
    
    if (!currentUserId) {
      console.error('No user ID available');
      toast({
        title: "Error",
        description: "Unable to send message. Please try refreshing the page.",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    if (assistantError) {
      console.error('Assistant ID error:', assistantError);
      toast({
        title: "Configuration Error",
        description: "Your airline or role configuration is not supported.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const conversationId = await ensureConversation(currentUserId, content);
      if (!conversationId) {
        throw new Error('Failed to create or get conversation');
      }

      console.log('Inserting user message into conversation:', conversationId);
      const userMessage = await insertUserMessage(content, conversationId);
      console.log('User message inserted:', userMessage);

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          content,
          subscriptionPlan: userProfile?.subscription_plan || 'free',
          assistantId
        }
      });

      if (error) throw error;
      
      console.log('Received AI response, inserting message');
      await insertAIMessage(data.response, conversationId);
      console.log('AI message inserted successfully');

    } catch (error) {
      console.error('Error in chat flow:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          if (newMessage.conversation_id === currentConversationId) {
            console.log('Adding message to chat:', newMessage);
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  return {
    messages,
    isLoading,
    sendMessage,
    currentUserId,
    currentConversationId,
    setCurrentConversationId,
    loadConversation,
    startNewChat,
    cleanup
  };
}