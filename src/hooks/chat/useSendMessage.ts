
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";
import { updateSessionApiActivity } from "@/services/session";

/**
 * Hook to handle sending messages and AI responses
 */
export function useSendMessage(
  currentUserId: string | null,
  currentConversationId: string | null,
  userProfile: any | null,
  insertUserMessage: (content: string, conversationId: string) => Promise<any>,
  insertAIMessage: (content: string, conversationId: string) => Promise<void>,
  ensureConversation: (userId: string, content?: string) => Promise<string | null>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "Unable to send message. Please try refreshing the page.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      if (isLoading) {
        console.log("Message sending is already in progress.");
        return;
      }

      setIsLoading(true);
      console.log("Sending message...");

      let tempMessage: Message | null = null;
      let conversationId: string | null = null;
      
      try {
        // Set the API call flag
        const apiCallId = Date.now().toString();
        sessionStorage.setItem('api_call_in_progress', 'true');
        sessionStorage.setItem('api_call_id', apiCallId);
        
        console.log(`API call started with ID: ${apiCallId}`);
        
        // Update session activity to prevent timeout during API call
        const currentToken = localStorage.getItem('session_token');
        if (currentToken) {
          await updateSessionApiActivity(currentToken);
        }

        // Ensure the conversation exists
        conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }

        // Create a temporary message for immediate display
        tempMessage = {
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          user_id: currentUserId,
          content: content,
          role: "user",
          created_at: new Date().toISOString(),
        };

        // Add the temporary message to the state immediately
        setMessages((prev) => {
          console.log("Adding temporary message to UI immediately:", tempMessage);
          return [...prev, tempMessage as Message];
        });
        
        // Insert the user message into the database
        const actualMessage = await insertUserMessage(content, conversationId);
        console.log("User message inserted into database:", actualMessage);

        // Replace the temporary message with the actual one
        if (actualMessage && actualMessage.id) {
          setMessages((prev) => {
            return prev.map(msg => 
              msg.id === tempMessage?.id ? 
                { ...actualMessage, role: "user" as "user" | "assistant" } : 
                msg
            );
          });
        }

        // Update session activity again before the AI call
        if (currentToken) {
          await updateSessionApiActivity(currentToken);
        }

        // Add an immediate AI typing indicator message
        const typingMessage: Message = {
          id: 'typing-' + Date.now().toString(),
          conversation_id: conversationId,
          user_id: null,
          content: '',
          role: "assistant",
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, typingMessage]);

        // Set timeout for AI response
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("AI response timeout")), 30000);
        });

        // Call the AI completion function with timeout
        const responsePromise = supabase.functions.invoke("chat-completion", {
          body: {
            content: `${content}`,
            subscriptionPlan: userProfile?.subscription_plan || "free",
            assistantId: userProfile?.assistant_id || "default_assistant_id",
          },
        });

        // Race between response and timeout
        const { data, error } = await Promise.race([
          responsePromise,
          timeoutPromise.then(() => ({ data: null, error: new Error("AI response timeout") }))
        ]) as any;

        if (error) {
          console.error("AI completion error:", error);
          throw error;
        }

        if (!data || !data.response) {
          console.error("Invalid response from AI completion:", data);
          throw new Error("Invalid response from chat-completion");
        }

        // Update session activity once more after the AI call
        if (currentToken) {
          await updateSessionApiActivity(currentToken);
        }

        // Remove the typing indicator message
        setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));

        // Insert the AI response
        await insertAIMessage(data.response, conversationId);
        console.log("AI message inserted.");
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message or receive response. Please try again.",
          variant: "destructive",
          duration: 3000,
        });

        // Remove typing indicator if it exists
        setMessages((prev) => {
          return prev.filter((msg) => !msg.id.toString().startsWith('typing-'));
        });

        // Remove the temporary message if an error occurs
        if (tempMessage) {
          setMessages((prev) => {
            console.log("Removing temporary message due to error:", tempMessage);
            return prev.filter((msg) => msg.id !== tempMessage!.id);
          });
        }
      } finally {
        // Clear the API call flag with a small delay
        const apiCallId = sessionStorage.getItem('api_call_id');
        console.log(`API call with ID ${apiCallId} completed, clearing flag after delay`);
        
        setTimeout(() => {
          sessionStorage.removeItem('api_call_in_progress');
          sessionStorage.removeItem('api_call_id');
          console.log("API call flag cleared");
        }, 500);
        
        setIsLoading(false);
        console.log("Message sending completed.");
      }
    },
    [
      currentUserId,
      ensureConversation,
      insertUserMessage,
      insertAIMessage,
      userProfile,
      toast,
      isLoading,
      currentConversationId,
      setMessages,
    ]
  );

  return { sendMessage, isLoading, setIsLoading };
}
