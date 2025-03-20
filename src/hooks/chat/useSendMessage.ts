
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";
import { updateSessionApiActivity } from "@/services/sessionService";

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
      
      try {
        // CRITICAL: Set the API call flag BEFORE doing anything else
        // Using a unique identifier to prevent conflicts between multiple calls
        const apiCallId = Date.now().toString();
        sessionStorage.setItem('api_call_in_progress', 'true');
        sessionStorage.setItem('api_call_id', apiCallId);
        
        console.log(`API call started with ID: ${apiCallId}`);
        
        // Update session activity to prevent timeout during API call
        const currentToken = localStorage.getItem('session_token');
        if (currentToken) {
          await updateSessionApiActivity(currentToken);
        }

        // Create a temporary message for optimistic update
        tempMessage = {
          id: crypto.randomUUID(), // Generate a temporary ID
          conversation_id: currentConversationId || "",
          user_id: currentUserId,
          content: content,
          role: "user",
          created_at: new Date().toISOString(),
        };

        // Add the temporary message to the state
        setMessages((prev) => {
          console.log("Adding temporary message:", tempMessage);
          return [...prev, tempMessage as Message];
        });

        // Ensure the conversation exists
        const conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }

        // Insert the user message into the database
        await insertUserMessage(content, conversationId);
        console.log("User message inserted.");

        // Update session activity again before the long-running AI call
        if (currentToken) {
          await updateSessionApiActivity(currentToken);
        }

        // Call the AI completion function
        const { data, error } = await supabase.functions.invoke("chat-completion", {
          body: {
            content: `${content}`,
            subscriptionPlan: userProfile?.subscription_plan || "free",
            assistantId: userProfile?.assistant_id || "default_assistant_id",
          },
        });

        if (error) {
          console.error("AI completion error:", error);
          throw error;
        }

        if (!data || !data.response) {
          console.error("Invalid response from AI completion:", data);
          throw new Error("Invalid response from chat-completion");
        }

        // Update session activity one more time after the AI call
        if (currentToken) {
          await updateSessionApiActivity(currentToken);
        }

        // Insert the AI response
        await insertAIMessage(data.response, conversationId);
        console.log("AI message inserted.");
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
          duration: 2000,
        });

        // Remove the temporary message if an error occurs
        if (tempMessage) {
          setMessages((prev) => {
            console.log("Removing temporary message due to error:", tempMessage);
            return prev.filter((msg) => msg.id !== tempMessage!.id);
          });
        }
      } finally {
        // CRITICAL: Clear the API call flag with a small delay to ensure all operations complete
        const apiCallId = sessionStorage.getItem('api_call_id');
        console.log(`API call with ID ${apiCallId} completed, clearing flag after delay`);
        
        // Use a short timeout to ensure any pending requests complete
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
