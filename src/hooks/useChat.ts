import { useEffect, useState } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const loadConversation = async (conversationId: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem('current-conversation-id', conversationId);
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(messages || []);
      setCurrentConversationId(conversationId);
      console.log('Loaded conversation:', conversationId, 'with', messages?.length || 0, 'messages');
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentUserId) return;

    setIsLoading(true);
    try {
      let conversationId = currentConversationId;

      if (!conversationId) {
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .insert([
            {
              user_id: currentUserId,
              title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            }
          ])
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = conversation.id;
        setCurrentConversationId(conversationId);
      }

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            conversation_id: conversationId,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (messageError) throw messageError;

      setMessages(prev => [...prev, message]);

      // Simulate AI response
      const aiResponse = {
        id: crypto.randomUUID(),
        content: "I am analyzing your contract...",
        user_id: 'ai',
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        role: 'assistant'
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem('current-conversation-id');
    localStorage.removeItem('current-chat-messages');
  };

  return {
    messages,
    isLoading,
    currentUserId,
    currentConversationId,
    sendMessage,
    loadConversation,
    setCurrentConversationId,
    startNewChat,
  };
}