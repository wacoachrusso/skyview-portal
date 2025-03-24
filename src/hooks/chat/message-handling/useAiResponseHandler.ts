
import { useCallback } from "react";
import { useAiResponse } from "../useAiResponse";

/**
 * Hook to handle AI response retrieval with retries
 */
export function useAiResponseHandler() {
  const { getAiResponse } = useAiResponse();

  /**
   * Gets an AI response with retry logic
   */
  const getResponseWithRetry = useCallback(
    async (content: string, userProfile: any) => {
      let aiResponseAttempts = 0;
      let aiResponse = null;
      
      while (!aiResponse && aiResponseAttempts < 2) {
        try {
          aiResponseAttempts++;
          console.log(`Attempting to get AI response (attempt ${aiResponseAttempts}/2)...`);
          
          const result = await getAiResponse(content, userProfile);
          
          if (result.error) {
            console.error(`AI completion error (attempt ${aiResponseAttempts}/2):`, result.error);
            
            if (aiResponseAttempts < 2) {
              // Wait briefly before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            throw result.error;
          }
          
          if (!result.data || !result.data.response) {
            console.error(`Invalid response from AI completion (attempt ${aiResponseAttempts}/2):`, result.data);
            
            if (aiResponseAttempts < 2) {
              // Wait briefly before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            throw new Error("Invalid response from chat-completion");
          }
          
          aiResponse = result.data.response;
        } catch (error) {
          console.error(`Error getting AI response (attempt ${aiResponseAttempts}/2):`, error);
          
          if (aiResponseAttempts >= 2) {
            throw error;
          }
          
          // Brief delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!aiResponse) {
        throw new Error("Failed to get AI response after multiple attempts");
      }
      
      return aiResponse;
    },
    [getAiResponse]
  );

  return { getResponseWithRetry };
}
