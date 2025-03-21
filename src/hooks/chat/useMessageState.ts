
import { useState } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage message state during the sending process
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

  // Create and add an AI typing indicator message
  const addTypingIndicator = (conversationId: string): Message => {
    const typingMessage: Message = {
      id: 'typing-' + Date.now().toString(),
      conversation_id: conversationId,
      user_id: null,
      content: '',
      role: "assistant",
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, typingMessage]);
    return typingMessage;
  };

  // Remove the typing indicator message
  const removeTypingIndicator = (typingMessageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));
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
    addTypingIndicator,
    removeTypingIndicator,
    removeMessage,
    showError
  };
}
