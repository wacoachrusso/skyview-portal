
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { useMessageOperations } from "./useMessageOperations";
import { useUserProfile } from "./useUserProfile";
import { Message } from "@/types/chat";
import { useRealTimeMessages } from "./chat/useRealTimeMessages";
import { useSendMessage } from "./chat/useSendMessage";
import { useNewChat } from "./chat/useNewChat";

export function useChat() {
  const { toast } = useToast();
  const { currentUserId, userProfile } = useUserProfile();
  const {
    currentConversationId,
    createNewConversation,
    ensureConversation,
    loadConversation,
    setCurrentConversationId,
  } = useConversation();

  const {
    messages,
    setMessages,
    isLoading: messagesLoading,
    setIsLoading: setMessagesLoading,
    insertUserMessage,
    insertAIMessage,
    loadMessages,
  } = useMessageOperations(currentUserId, currentConversationId);

  // Handle real-time message updates
  useRealTimeMessages(currentConversationId, (newMessage) => {
    // Check for duplicates before adding to state
    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === newMessage.id);
      return exists ? prev : [...prev, newMessage];
    });
  });

  // Handle sending messages
  const { sendMessage, isLoading, setIsLoading } = useSendMessage(
    currentUserId,
    currentConversationId,
    userProfile,
    insertUserMessage,
    insertAIMessage,
    ensureConversation,
    setMessages
  );

  // Handle new chat creation
  const { startNewChat } = useNewChat(
    currentUserId,
    createNewConversation,
    setCurrentConversationId,
    setMessages,
    setIsLoading
  );

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, loadMessages]);

  return {
    messages,
    currentUserId,
    isLoading: isLoading || messagesLoading,
    sendMessage,
    createNewConversation,
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    userProfile,
    startNewChat,
  };
}
