
import { useCallback } from "react";
import { Message } from "@/types/chat";

/**
 * Hook to handle streaming message updates
 */
export function useMessageStream(
  addStreamingMessage: (conversationId: string) => string,
  updateStreamingMessage: (streamingId: string, content: string) => void,
  finishStreamingMessage: (streamingId: string, finalContent: string) => void,
  removeMessage: (messageId: string) => void
) {
  /**
   * Sets up and manages a streaming message
   */
  const handleStreamingMessage = useCallback(
    async (conversationId: string, aiResponsePromise: Promise<any>) => {
      // Add a streaming message placeholder immediately for real-time updates
      const streamingMessageId = addStreamingMessage(conversationId);
      
      try {
        // Wait for the AI response
        const { data, error } = await aiResponsePromise;
        
        if (error || !data || !data.response) {
          // Remove streaming message if there's an error
          if (streamingMessageId) {
            removeMessage(streamingMessageId);
          }
          
          if (error) throw error;
          throw new Error("Invalid response from chat-completion");
        }
        
        // Update the streaming message with the complete response
        if (streamingMessageId) {
          finishStreamingMessage(streamingMessageId, data.response);
        }
        
        return data.response;
      } catch (error) {
        // Remove the streaming message on failure
        if (streamingMessageId) {
          removeMessage(streamingMessageId);
        }
        throw error;
      }
    },
    [addStreamingMessage, updateStreamingMessage, finishStreamingMessage, removeMessage]
  );

  return { handleStreamingMessage };
}
