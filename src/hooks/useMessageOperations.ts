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
    return userMessage;
  };

  const insertAIMessage = async (content: string, conversationId: string) => {
    console.log('Inserting AI message:', { conversationId });
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert([
        {
          content,
          user_id: null,
          role: 'assistant',
          conversation_id: conversationId
        }
      ]);

    if (aiMessageError) throw aiMessageError;
  };

  const loadMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    console.log('Loading messages for conversation:', conversationId);
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    console.log('Loaded messages:', messages?.length || 0);
    setMessages(messages || []);
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