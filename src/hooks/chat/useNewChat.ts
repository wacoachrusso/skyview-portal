
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
      // Set loading state to prevent UI flickering
      setIsLoading(true);
      
      // First create the new conversation if user is logged in
      if (currentUserId) {
        const newConversationId = await createNewConversation(currentUserId);
        // Only after we have the new ID and it's ready, we clear the old messages
        // This prevents the UI from briefly showing empty state before new content loads
        if (newConversationId) {
          setMessages([]);
          setCurrentConversationId(newConversationId);
        }
      } else {
        // If no user, just clear messages
        setMessages([]);
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
