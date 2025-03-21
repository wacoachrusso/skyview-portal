
import { useCallback } from "react";
import { Message } from "@/types/chat";
import { useMessageState } from "./useMessageState";
import { useApiCallState } from "./useApiCallState";
import { useAiResponse } from "./useAiResponse";

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
  const {
    isLoading,
    setIsLoading,
    createTempUserMessage,
    addTempMessage,
    updateTempMessage,
    addTypingIndicator,
    removeTypingIndicator,
    removeMessage,
    showError
  } = useMessageState(setMessages, currentUserId);

  const { setupApiCall, clearApiCall, updateSessionActivity } = useApiCallState();
  const { getAiResponse } = useAiResponse();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId) {
        showError("Unable to send message. Please try refreshing the page.");
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
      let apiCallId: string | null = null;
      
      try {
        // Set the API call flag
        apiCallId = setupApiCall();
        
        // Update session activity to prevent timeout during API call
        await updateSessionActivity();

        // Ensure the conversation exists
        conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }

        // Create and display temporary user message
        tempMessage = createTempUserMessage(content, conversationId);
        addTempMessage(tempMessage);
        
        // Insert the user message into the database
        const actualMessage = await insertUserMessage(content, conversationId);
        console.log("User message inserted into database:", actualMessage);

        // Replace temporary message with the actual one
        updateTempMessage(tempMessage.id, actualMessage);

        // Update session activity again before the AI call
        await updateSessionActivity();

        // Add AI typing indicator
        const typingMessage = addTypingIndicator(conversationId);

        // Get AI response
        const { data, error } = await getAiResponse(content, userProfile);

        if (error) {
          console.error("AI completion error:", error);
          throw error;
        }

        if (!data || !data.response) {
          console.error("Invalid response from AI completion:", data);
          throw new Error("Invalid response from chat-completion");
        }

        // Update session activity once more after the AI call
        await updateSessionActivity();

        // Remove typing indicator
        removeTypingIndicator(typingMessage.id);

        // Insert the AI response
        await insertAIMessage(data.response, conversationId);
        console.log("AI message inserted.");
      } catch (error) {
        console.error("Error sending message:", error);
        showError("Failed to send message or receive response. Please try again.");

        // Remove typing indicator if it exists
        setMessages((prev) => {
          return prev.filter((msg) => !msg.id.toString().startsWith('typing-'));
        });

        // Remove the temporary message if an error occurs
        if (tempMessage) {
          removeMessage(tempMessage.id);
        }
      } finally {
        // Clear the API call flag
        if (apiCallId) {
          clearApiCall(apiCallId);
        }
        
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
      isLoading,
      currentConversationId,
      setMessages,
      setupApiCall,
      clearApiCall,
      updateSessionActivity,
      createTempUserMessage,
      addTempMessage,
      updateTempMessage,
      addTypingIndicator,
      removeTypingIndicator,
      removeMessage,
      showError,
      getAiResponse
    ]
  );

  return { sendMessage, isLoading, setIsLoading };
}
