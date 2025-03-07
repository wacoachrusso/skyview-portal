import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export function useMessageOperations(currentUserId: string | null, currentConversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const insertUserMessage = async (content: string, conversationId: string) => {
    console.log('Inserting user message:', { content, conversationId });

    try {
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            role: 'user',
            conversation_id: conversationId,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (userMessageError) {
        console.error('Error inserting user message:', userMessageError);
        throw userMessageError;
      }

      console.log('User message inserted:', userMessage);
      return userMessage;
    } catch (error) {
      console.error('Error in insertUserMessage:', error);
      throw error;
    }
  };

  const insertAIMessage = async (content: string, conversationId: string) => {
    console.log('Inserting AI message:', { conversationId });

    try {
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: null,
            role: 'assistant',
            conversation_id: conversationId,
            created_at: new Date().toISOString(),
          }
        ]);

      if (aiMessageError) {
        console.error('Error inserting AI message:', aiMessageError);
        throw aiMessageError;
      }

      console.log('AI message inserted successfully');
    } catch (error) {
      console.error('Error in insertAIMessage:', error);
      throw error;
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!conversationId) return;

    console.log('Loading messages for conversation:', conversationId);
    const { data: messagesData, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    // Ensure the role is properly typed when setting messages
    const typedMessages = messagesData?.map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    })) || [];

    console.log('Loaded messages:', typedMessages.length);
    setMessages(typedMessages);
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    insertUserMessage,
    insertAIMessage,
    loadMessages
  };
}