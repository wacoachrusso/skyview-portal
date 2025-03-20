
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to handle creating a new chat conversation
 */
export function useNewChat(
  currentUserId: string | null,
  createNewConversation: (userId: string) => Promise<string | null>,
  setCurrentConversationId: (id: string | null) => void,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  setIsLoading: (isLoading: boolean) => void
) {
  const { toast } = useToast();

  // Start a new chat
  const startNewChat = useCallback(async () => {
    try {
      setMessages([]);
      setIsLoading(false);
      setCurrentConversationId(null);

      if (currentUserId) {
        const newConversationId = await createNewConversation(currentUserId);
        if (newConversationId) {
          setCurrentConversationId(newConversationId);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new chat. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, [createNewConversation, currentUserId, setCurrentConversationId, setMessages, setIsLoading, toast]);

  return { startNewChat };
}
