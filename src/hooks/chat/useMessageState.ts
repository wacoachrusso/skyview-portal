
import { Message } from "@/types/chat";
import { useBaseMessageState } from "./message-state/useBaseMessageState";
import { useTempMessageState } from "./message-state/useTempMessageState";
import { useStreamingMessageState } from "./message-state/useStreamingMessageState";
import { useMessageErrorHandling } from "./message-state/useMessageErrorHandling";

/**
 * Hook to manage message state during the sending process
 * with support for streaming message updates
 */
export function useMessageState(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  currentUserId: string | null
) {
  // Base message state management (loading state, remove messages)
  const { isLoading, setIsLoading, removeMessage } = useBaseMessageState(setMessages);
  
  // Temporary message handling (create, add, update temp messages)
  const { createTempUserMessage, addTempMessage, updateTempMessage } = 
    useTempMessageState(setMessages, currentUserId);
  
  // Streaming message functionality (add, update, finish streaming)
  const { addStreamingMessage, updateStreamingMessage, finishStreamingMessage } = 
    useStreamingMessageState(setMessages);
  
  // Error handling for messages
  const { showError } = useMessageErrorHandling();

  // Return all the functions and state from the composed hooks
  return {
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
  };
}
