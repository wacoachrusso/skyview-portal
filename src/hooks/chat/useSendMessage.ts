
import { useCallback } from "react";
import { Message } from "@/types/chat";
import { useMessageState } from "./useMessageState";
import { useApiCallState } from "./useApiCallState";
import { useAiResponse } from "./useAiResponse";
import { useToast } from "@/hooks/use-toast";

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
  const { getAiResponse } = useAiResponse();
  const { toast } = useToast();

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
      let streamingMessageId: string | null = null;
      
      try {
        // Set the API call flag - immediate, no delay
        apiCallId = setupApiCall();
        
        // Ensure the conversation exists - immediate, no delay
        let createAttempts = 0;
        while (!conversationId && createAttempts < 3) {
          try {
            conversationId = await ensureConversation(currentUserId, content);
            createAttempts++;
            if (!conversationId) {
              console.warn(`Failed to create/get conversation, attempt ${createAttempts}/3`);
              await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay before retry
            }
          } catch (error) {
            console.error(`Error ensuring conversation (attempt ${createAttempts}/3):`, error);
            if (createAttempts >= 3) {
              throw new Error("Failed to create or get conversation after multiple attempts");
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay before retry
          }
        }
        
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }
        
        // Create and display temporary user message - immediate, no delay
        tempMessage = createTempUserMessage(content, conversationId);
        addTempMessage(tempMessage);
        
        // Add streaming AI message placeholder immediately for real-time updates
        streamingMessageId = addStreamingMessage(conversationId);
        
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

        // Get AI response - critical path
        let aiResponseAttempts = 0;
        let aiResponse = null;
        
        while (!aiResponse && aiResponseAttempts < 2) {
          try {
            aiResponseAttempts++;
            console.log(`Attempting to get AI response (attempt ${aiResponseAttempts}/2)...`);
            
            const { data, error } = await getAiResponse(content, userProfile);
            
            if (error) {
              console.error(`AI completion error (attempt ${aiResponseAttempts}/2):`, error);
              
              if (aiResponseAttempts < 2) {
                // Wait briefly before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              throw error;
            }
            
            if (!data || !data.response) {
              console.error(`Invalid response from AI completion (attempt ${aiResponseAttempts}/2):`, data);
              
              if (aiResponseAttempts < 2) {
                // Wait briefly before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              throw new Error("Invalid response from chat-completion");
            }
            
            aiResponse = data.response;
            
            // Update the streaming message with the complete response
            if (streamingMessageId) {
              finishStreamingMessage(streamingMessageId, aiResponse);
            }
            
          } catch (error) {
            console.error(`Error getting AI response (attempt ${aiResponseAttempts}/2):`, error);
            
            if (aiResponseAttempts >= 2) {
              // If streaming message exists, remove it on final failure
              if (streamingMessageId) {
                removeMessage(streamingMessageId);
              }
              throw error;
            }
            
            // Brief delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!aiResponse) {
          throw new Error("Failed to get AI response after multiple attempts");
        }

        // Ensure user message is inserted (await the promise now if it hasn't completed)
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
        
        // Remove streaming message if it exists
        if (streamingMessageId) {
          removeMessage(streamingMessageId);
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
      addStreamingMessage,
      updateStreamingMessage,
      finishStreamingMessage,
      removeMessage,
      showError,
      getAiResponse,
      toast
    ]
  );

  return { sendMessage, isLoading, setIsLoading };
}
