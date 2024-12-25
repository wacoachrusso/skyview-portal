import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { updateConversationTitle } from "@/utils/conversationUtils";

export function useChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    currentConversationId, 
    createNewConversation, 
    ensureConversation,
    loadConversation, 
    setCurrentConversationId 
  } = useConversation();

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
    
    setIsLoading(true);
    
    try {
      // Ensure we have a conversation before sending the message
      const conversationId = await ensureConversation(currentUserId);
      if (!conversationId) {
        throw new Error('Failed to create or get conversation');
      }

      // Update conversation's last_message_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          title: content.slice(0, 50) // Use first message as title
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      // Save user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            role: 'user',
            conversation_id: conversationId
          }
        ])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Get response
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { content }
      });

      if (error) throw error;

      // Save response
      const { error: responseError } = await supabase
        .from('messages')
        .insert([
          {
            content: data.response,
            user_id: null,
            role: 'assistant',
            conversation_id: conversationId
          }
        ]);

      if (responseError) throw responseError;

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
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No user found, redirecting to login');
        return null;
      }
      console.log('User authenticated:', session.user.id);
      setCurrentUserId(session.user.id);
      return session.user.id;
    };

    const setupChat = async () => {
      const userId = await checkAuth();
      if (!userId) return;
    };

    setupChat();

    // Set up real-time subscription
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

  return {
    messages,
    currentUserId,
    isLoading,
    sendMessage,
    createNewConversation,
    currentConversationId,
    loadConversation: async (conversationId: string) => {
      if (!conversationId) {
        console.log('No conversation ID provided');
        setMessages([]);
        return;
      }
      const messages = await loadConversation(conversationId);
      setMessages(messages);
    },
    setCurrentConversationId
  };
}