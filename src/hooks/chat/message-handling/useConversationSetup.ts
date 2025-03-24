
import { useCallback } from "react";

/**
 * Hook to handle conversation creation and setup
 */
export function useConversationSetup(
  ensureConversation: (userId: string, content?: string) => Promise<string | null>
) {
  /**
   * Ensures a conversation exists, with retries
   */
  const setupConversation = useCallback(
    async (userId: string, content: string): Promise<string> => {
      let conversationId: string | null = null;
      let createAttempts = 0;
      
      while (!conversationId && createAttempts < 3) {
        try {
          conversationId = await ensureConversation(userId, content);
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
      
      return conversationId;
    },
    [ensureConversation]
  );

  return { setupConversation };
}
