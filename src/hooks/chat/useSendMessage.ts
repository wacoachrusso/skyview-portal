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

        // Ensure the conversation exists first before adding any messages
        conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }

        // Create a temporary message for optimistic update
        tempMessage = {
          id: crypto.randomUUID(), // Generate a temporary ID
          conversation_id: conversationId,
          user_id: currentUserId,
          content: content,
          role: "user",
          created_at: new Date().toISOString(),
        };

        // IMPORTANT: Add the temporary message to the state IMMEDIATELY
        // This ensures the message appears in the UI right away
        setMessages((prev) => {
          console.log("Adding temporary message to UI immediately:", tempMessage);
          return [...prev, tempMessage as Message];
        });
        
        // Delay a tiny bit to ensure UI updates before heavy processing
        await new Promise(resolve => setTimeout(resolve, 50));

        // Insert the user message into the database
        // Making sure to wait for this operation to complete before proceeding
        const actualMessage = await insertUserMessage(content, conversationId);
        console.log("User message inserted into database:", actualMessage);

        // Replace the temporary message with the actual one (with real ID)
        if (actualMessage && actualMessage.id) {
          setMessages((prev) => {
            return prev.map(msg => 
              msg.id === tempMessage?.id ? 
                { ...actualMessage, role: "user" as "user" | "assistant" } : 
                msg
            );
          });
        }

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
