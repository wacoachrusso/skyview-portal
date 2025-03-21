export function useQuestionHandler(
  currentConversationId: string | null,
  createNewConversation: (initialMessage?: string) => Promise<string | null>,
  handleSendMessage: (content: string, conversationId: string) => Promise<void>
) {
  const handleSelectQuestion = async (question: string) => {
    // If no conversation exists yet, create one
    if (!currentConversationId) {
      const newConversationId = await createNewConversation(question);
      if (newConversationId) {
        // Send the message in the new conversation
        handleSendMessage(question, newConversationId);
      }
    } else {
      // Otherwise just send the message in the current conversation
      handleSendMessage(question, currentConversationId);
    }
  };

  return { handleSelectQuestion };
}
