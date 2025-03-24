
import { useCallback } from "react";
import { Message } from "@/types/chat";
import { useMessageState } from "./useMessageState";
import { useApiCallState } from "./useApiCallState";
import { useToast } from "@/hooks/use-toast";
import { useConversationSetup } from "./message-handling/useConversationSetup";
import { useMessageStream } from "./message-handling/useMessageStream";
import { useAiResponseHandler } from "./message-handling/useAiResponseHandler";

/**
 * Hook to handle sending messages and streaming AI responses for real-time display
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
    addStreamingMessage,
    updateStreamingMessage,
    finishStreamingMessage,
    removeMessage,
    showError
  } = useMessageState(setMessages, currentUserId);

  const { setupApiCall, clearApiCall, updateSessionActivity } = useApiCallState();
  const { toast } = useToast();
  const { setupConversation } = useConversationSetup(ensureConversation);
  const { handleStreamingMessage } = useMessageStream(
    addStreamingMessage,
    updateStreamingMessage,
    finishStreamingMessage,
    removeMessage
  );
  const { getResponseWithRetry } = useAiResponseHandler();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "You need to be logged in to send messages.",
          variant: "destructive",
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
      let apiCallId: string | null = null;
      
      try {
        // Set the API call flag - immediate, no delay
        apiCallId = setupApiCall();
        
        // Ensure the conversation exists
        conversationId = await setupConversation(currentUserId, content);
        
        // Create and display temporary user message
        tempMessage = createTempUserMessage(content, conversationId);
        addTempMessage(tempMessage);
        
        // Update session activity - run in parallel
        updateSessionActivity().catch(error => {
          console.error("Session activity update failed:", error);
          // Non-critical failure, continue with message sending
        });

        // Insert the user message into the database - can run in parallel
        const userMessagePromise = insertUserMessage(content, conversationId)
          .then(actualMessage => {
            console.log("User message inserted into database:", actualMessage);
            // Update temp message with actual one
            if (tempMessage) {
              updateTempMessage(tempMessage.id, actualMessage);
            }
            return actualMessage;
          })
          .catch(error => {
            console.error("Error inserting user message:", error);
            // Continue with the flow despite error (non-blocking)
            return null;
          });

        // Set up AI streaming response
        const aiResponsePromise = getResponseWithRetry(content, userProfile);
        const aiResponse = await handleStreamingMessage(conversationId, 
          Promise.resolve({ data: { response: await aiResponsePromise }, error: null })
        );

        // Ensure user message is inserted (await the promise if it hasn't completed)
        await userMessagePromise;

        // Insert the AI response - non-blocking
        insertAIMessage(aiResponse, conversationId)
          .then(() => {
            console.log("AI message inserted successfully");
          })
          .catch(error => {
            console.error("Error inserting AI message:", error);
            toast({
              title: "Warning",
              description: "Your message was processed but couldn't be saved. The response might not appear in your chat history.",
              variant: "default",
            });
            // Continue despite error (non-blocking)
          });
          
        // Update session activity again (non-blocking)
        updateSessionActivity().catch(console.error);
        
      } catch (error) {
        console.error("Error sending message:", error);
        
        // Provide more specific error messages based on the error type
        let errorMessage = "Failed to send message or receive response. Please try again.";
        
        if (error.message?.includes('conversation')) {
          errorMessage = "Could not create conversation. Please refresh the page and try again.";
        } else if (error.message?.includes('timeout')) {
          errorMessage = "Request timed out. The AI service might be busy. Please try again in a moment.";
        } else if (error.message?.includes('network') || error.message?.includes('connection')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        showError(errorMessage);

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
      isLoading,
      setIsLoading,
      setupApiCall,
      clearApiCall,
      setupConversation,
      createTempUserMessage,
      addTempMessage,
      updateTempMessage,
      updateSessionActivity,
      insertUserMessage,
      insertAIMessage,
      getResponseWithRetry,
      handleStreamingMessage,
      updateTempMessage,
      removeMessage,
      showError,
      toast,
      userProfile
    ]
  );

  return { sendMessage, isLoading, setIsLoading };
}
