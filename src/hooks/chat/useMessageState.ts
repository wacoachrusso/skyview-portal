
import { useState } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage message state during the sending process
 * with support for streaming message updates
 */
export function useMessageState(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  currentUserId: string | null
) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  // Add a streaming AI message that will be updated in real-time
  const addStreamingMessage = (conversationId: string): string => {
    const streamingId = 'streaming-' + Date.now().toString();
    const streamingMessage: Message = {
      id: streamingId,
      conversation_id: conversationId,
      user_id: null,
      content: '',
      role: "assistant",
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, streamingMessage]);
    return streamingId;
  };

  // Update the streaming message content as it arrives
  const updateStreamingMessage = (streamingId: string, content: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === streamingId 
          ? { ...msg, content: content }
          : msg
      )
    );
  };

  // Finish the streaming message with final content
  const finishStreamingMessage = (streamingId: string, finalContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === streamingId 
          ? { ...msg, content: finalContent }
          : msg
      )
    );
  };

  // Remove a message by its ID
  const removeMessage = (messageId: string) => {
    setMessages((prev) => {
      console.log("Removing message:", messageId);
      return prev.filter((msg) => msg.id !== messageId);
    });
  };

  // Show an error toast notification
  const showError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 3000,
    });
  };

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
