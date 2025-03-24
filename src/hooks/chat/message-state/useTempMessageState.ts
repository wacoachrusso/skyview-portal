
import { Message } from "@/types/chat";

/**
 * Hook to manage temporary message creation and updates
 */
export function useTempMessageState(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  currentUserId: string | null
) {
  // Create a temporary user message for immediate display
  const createTempUserMessage = (content: string, conversationId: string): Message => {
    return {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: currentUserId as string,
      content: content,
      role: "user",
      created_at: new Date().toISOString(),
    };
  };

  // Add a temporary message to the state
  const addTempMessage = (tempMessage: Message) => {
    setMessages((prev) => {
      console.log("Adding temporary message to UI immediately:", tempMessage);
      return [...prev, tempMessage];
    });
  };

  // Replace a temporary message with the actual one from the database
  const updateTempMessage = (tempId: string, actualMessage: any) => {
    if (actualMessage && actualMessage.id) {
      setMessages((prev) => {
        return prev.map(msg => 
          msg.id === tempId ? 
            { ...actualMessage, role: "user" as "user" | "assistant" } : 
            msg
        );
      });
    }
  };

  return {
    createTempUserMessage,
    addTempMessage,
    updateTempMessage,
  };
}
