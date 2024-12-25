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
  const { currentConversationId, createNewConversation, loadConversation, setCurrentConversationId } = useConversation();

  const sendMessage = async (content: string) => {
    console.log('Sending message:', { content, conversationId: currentConversationId });
    
    if (!currentUserId || !currentConversationId) {
      console.error('No user ID or conversation ID available', { currentUserId, currentConversationId });
      toast({
        title: "Error",
        description: "Unable to send message. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update conversation's last_message_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          // Update title with first message content if it's the first message
          ...(messages.length === 0 && { title: content.slice(0, 50) }) // Limit title to 50 chars
        })
        .eq('id', currentConversationId);

      if (updateError) throw updateError;

      // Save user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            role: 'user',
            conversation_id: currentConversationId
          }
        ])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { content }
      });

      if (error) throw error;

      // Save AI response
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content: data.response,
            user_id: null,
            role: 'assistant',
            conversation_id: currentConversationId
          }
        ]);

      if (aiMessageError) throw aiMessageError;

    } catch (error) {
      console.error('Error in chat flow:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
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

      // Only create a new conversation if we don't have one
      if (!currentConversationId) {
        console.log('No current conversation, creating new one...');
        const conversationId = await createNewConversation(userId);
        if (conversationId) {
          const messages = await loadConversation(conversationId);
          setMessages(messages);
        }
      }
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
        return;
      }
      const messages = await loadConversation(conversationId);
      setMessages(messages);
    }
  };
}