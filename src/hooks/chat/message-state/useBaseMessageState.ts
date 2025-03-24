
import { useState } from "react";
import { Message } from "@/types/chat";

/**
 * Hook for core message state management
 */
export function useBaseMessageState(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) {
  const [isLoading, setIsLoading] = useState(false);

  // Remove a message by its ID
  const removeMessage = (messageId: string) => {
    setMessages((prev) => {
      console.log("Removing message:", messageId);
      return prev.filter((msg) => msg.id !== messageId);
    });
  };

  return {
    isLoading,
    setIsLoading,
    removeMessage,
  };
}
