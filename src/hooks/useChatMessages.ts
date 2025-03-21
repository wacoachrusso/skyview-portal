
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from '@/types/chat';
import { useToast } from "@/hooks/use-toast";

export function useChatMessages(currentUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    console.log("Handling message:", { messageContent, conversationId: currentConversationId });
    setIsLoading(true);

    try {
      // First add a user message
      const userMessage = {
        conversation_id: currentConversationId,
        user_id: currentUserId,
        content: messageContent,
        role: 'user' as "user" | "assistant"
      };
      
      // Insert user message
      const { data: userData, error: userError } = await supabase
        .from('messages')
        .insert([userMessage])
        .select('*')
        .single();

      if (userError) {
        console.error("Error sending user message:", userError);
        throw userError;
      }

      // Ensure the typed message is added to state immediately
      setMessages(prevMessages => [
        ...prevMessages, 
        { ...userData, role: userData.role as "user" | "assistant" }
      ]);

      console.log("User message sent successfully", userData);
      
      // Now call the AI assistant for response
      // Add a temporary typing indicator message
      const typingId = `typing-${Date.now()}`;
      const typingMessage = {
        id: typingId,
        conversation_id: currentConversationId,
        user_id: null,
        content: "",
        role: 'assistant' as "user" | "assistant",
        created_at: new Date().toISOString(),
      };
      
      // Show typing indicator
      setMessages(prevMessages => [...prevMessages, typingMessage]);
      
      // Call the AI chat completion function
      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: {
          content: messageContent,
          subscriptionPlan: "annual", // Default to annual for full features
          assistantId: "default_assistant_id" // Use default assistant
        },
      });

      // Remove typing indicator
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== typingId));

      if (error) {
        console.error("Error getting AI response:", error);
        throw error;
      }

      if (!data || !data.response) {
        throw new Error("Invalid response from AI completion");
      }

      // Create AI response message
      const aiMessage = {
        conversation_id: currentConversationId,
        user_id: null,
        content: data.response,
        role: 'assistant' as "user" | "assistant"
      };

      // Insert AI message into database
      const { data: aiData, error: aiError } = await supabase
        .from('messages')
        .insert([aiMessage])
        .select('*')
        .single();

      if (aiError) {
        console.error("Error sending AI message:", aiError);
        throw aiError;
      }

      // Add AI message to state
      setMessages(prevMessages => [
        ...prevMessages, 
        { ...aiData, role: aiData.role as "user" | "assistant" }
      ]);

      console.log("AI response sent successfully");

    } catch (err) {
      console.error("Error in message flow:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
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
