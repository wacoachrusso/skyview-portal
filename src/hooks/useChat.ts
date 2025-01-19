import { useEffect } from "react";
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
    
    try {
      setIsLoading(true);
      
      // Ensure we have a conversation ID
      const conversationId = await ensureConversation(currentUserId, content);
      if (!conversationId) {
        throw new Error('Failed to create or get conversation');
      }

      console.log('Inserting user message into conversation:', conversationId);
      const userMessage = await insertUserMessage(content, conversationId);
      console.log('User message inserted:', userMessage);

      // Add the user message to the local state immediately
      setMessages(prev => [...prev, {
        ...userMessage,
        role: 'user' as const
      }]);

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          content,
          subscriptionPlan: userProfile?.subscription_plan || 'free'
        }
      });

      if (error) {
        console.error('Error from chat-completion:', error);
        throw error;
      }

      if (!data || !data.response) {
        console.error('Invalid response from chat-completion:', data);
        throw new Error('Invalid response from AI');
      }
      
      console.log('Received AI response:', data.response);
      await insertAIMessage(data.response, conversationId);
      
      // Add the AI message to the local state
      const newAiMessage: Message = {
        content: data.response,
        role: 'assistant',
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        id: crypto.randomUUID(),
        user_id: null
      };
      
      setMessages(prev => [...prev, newAiMessage]);

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

  const startNewChat = async () => {
    console.log('Starting new chat session...');
    setMessages([]);
    setCurrentConversationId(null);
    setIsLoading(false);
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
    currentUserId,
    isLoading,
    sendMessage,
    createNewConversation,
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    userProfile,
    startNewChat
  };
}