import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export function useChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createNewConversation = async (userId: string) => {
    console.log('Creating new conversation for user:', userId);
    try {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        throw conversationError;
      }
      
      console.log('New conversation created:', newConversation);
      setCurrentConversationId(newConversation.id);
      return newConversation.id;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
      return null;
    }
  };

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
        .update({ last_message_at: new Date().toISOString() })
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, redirecting to login');
        return null;
      }
      console.log('User authenticated:', user.id);
      setCurrentUserId(user.id);
      return user.id;
    };

    const setupChat = async () => {
      const userId = await checkAuth();
      if (!userId) return;

      // Only create a new conversation if we don't have one
      if (!currentConversationId) {
        const conversationId = await createNewConversation(userId);
        if (conversationId) {
          const { data: existingMessages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages:', messagesError);
          } else if (existingMessages) {
            console.log('Loaded existing messages:', existingMessages);
            setMessages(existingMessages);
          }
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
    createNewConversation
  };
}