
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { setNewChatFlag } from "@/utils/navigation";

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
      // Set a flag to prevent flickering during navigation
      setNewChatFlag();
      
      // Set loading state to prevent UI flickering
      setIsLoading(true);
      
      // First clear the old messages to give immediate feedback
      setMessages([]);
      
      // Create the new conversation if user is logged in
      if (currentUserId) {
        const newConversationId = await createNewConversation(currentUserId);
        if (newConversationId) {
          setCurrentConversationId(newConversationId);
        }
      } else {
        // If no user, just clear any conversation ID
        setCurrentConversationId(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new chat. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      // Always turn off loading when done
      setIsLoading(false);
    }
  }, [createNewConversation, currentUserId, setCurrentConversationId, setMessages, setIsLoading, toast]);

  return { startNewChat };
}
