
import { useCallback } from "react";
import { Message } from "@/types/chat";
import { useMessageState } from "./useMessageState";
import { useApiCallState } from "./useApiCallState";
import { useAiResponse } from "./useAiResponse";

/**
 * Hook to handle sending messages and AI responses with optimized performance
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
        // Set the API call flag - immediate, no delay
        apiCallId = setupApiCall();
        
        // Add typing indicator immediately for instant feedback
        const typingMessage = addTypingIndicator("pending-conversation");
        
        // Ensure the conversation exists - immediate, no delay
        conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }

        // Update the typing indicator with the correct conversation ID
        typingMessage.conversation_id = conversationId;
        
        // Create and display temporary user message - immediate, no delay
        tempMessage = createTempUserMessage(content, conversationId);
        addTempMessage(tempMessage);
        
        // Update session activity - run in parallel
        updateSessionActivity().catch(console.error);

        // Insert the user message into the database - can run in parallel
        insertUserMessage(content, conversationId)
          .then(actualMessage => {
            console.log("User message inserted into database:", actualMessage);
            // Update temp message with actual one
            updateTempMessage(tempMessage!.id, actualMessage);
          })
          .catch(error => {
            console.error("Error inserting user message:", error);
            // Continue with the flow despite error (non-blocking)
          });

        // Get AI response - critical path
        const { data, error } = await getAiResponse(content, userProfile);

        if (error) {
          console.error("AI completion error:", error);
          throw error;
        }

        if (!data || !data.response) {
          console.error("Invalid response from AI completion:", data);
          throw new Error("Invalid response from chat-completion");
        }

        // Remove typing indicator
        removeTypingIndicator(typingMessage.id);

        // Insert the AI response - non-blocking
        insertAIMessage(data.response, conversationId)
          .then(() => {
            console.log("AI message inserted successfully");
          })
          .catch(error => {
            console.error("Error inserting AI message:", error);
            // Continue despite error (non-blocking)
          });
          
        // Update session activity again (non-blocking)
        updateSessionActivity().catch(console.error);
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
