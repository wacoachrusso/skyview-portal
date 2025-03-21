
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from '@/types/chat';
import { useToast } from "@/hooks/use-toast";

export function useChatMessages(currentUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setError(error as any);
      } else if (data) {
        // Ensure the role is properly typed as "user" | "assistant"
        const typedMessages = data.map(msg => ({
          ...msg,
          role: msg.role as "user" | "assistant"
        }));
        setMessages(typedMessages);
      }
    } catch (err) {
      console.error("Unexpected error fetching messages:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async (messageContent: string, currentConversationId: string) => {
    if (!currentUserId || !currentConversationId) {
      console.error("User or conversation ID is missing.");
      return;
    }

    // First add a user message
    const userMessage = {
      conversation_id: currentConversationId,
      user_id: currentUserId,
      content: messageContent,
      role: 'user' as "user" | "assistant"  // Explicitly type as "user"
    };

    try {
      // Insert user message
      const { data: userData, error: userError } = await supabase
        .from('messages')
        .insert([userMessage])
        .select('*')
        .single();

      if (userError) {
        console.error("Error sending user message:", userError);
        setError(userError as any);
        return;
      }

      // Ensure the typed message is added to state
      setMessages(prevMessages => [
        ...prevMessages, 
        { ...userData, role: userData.role as "user" | "assistant" }
      ]);

      // Now simulate AI response
      setIsLoading(true);
      
      // Simulate AI thinking time
      setTimeout(async () => {
        // Create AI response
        const aiMessage = {
          conversation_id: currentConversationId,
          user_id: currentUserId,
          content: "I'm sorry, but I can only answer questions directly related to your union contract's terms, policies, or provisions. For other topics, please contact appropriate resources or refocus your question on contract-related matters.",
          role: 'assistant' as "user" | "assistant"  // Explicitly type as "assistant"
        };

        try {
          const { data: aiData, error: aiError } = await supabase
            .from('messages')
            .insert([aiMessage])
            .select('*')
            .single();

          if (aiError) {
            console.error("Error sending AI message:", aiError);
            setError(aiError as any);
          } else if (aiData) {
            // Ensure the typed message is added to state
            setMessages(prevMessages => [
              ...prevMessages, 
              { ...aiData, role: aiData.role as "user" | "assistant" }
            ]);
          }
        } catch (err) {
          console.error("Unexpected error sending AI message:", err);
          setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
        } finally {
          setIsLoading(false);
        }
      }, 1500);

    } catch (err) {
      console.error("Unexpected error in message flow:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    error,
    fetchMessages,
    handleSendMessage
  };
}
