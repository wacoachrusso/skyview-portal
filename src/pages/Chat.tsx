
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChatContent } from "@/components/chat/ChatContent";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useConversationManager } from "@/hooks/useConversationManager";
import { useWelcomeState } from "@/hooks/useWelcomeState";
import { useChatClipboard } from "@/utils/clipboardUtils";
import { useQuestionHandler } from "@/hooks/useQuestionHandler";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Chat() {
  const { currentUserId } = useUserProfile();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  
  const {
    messages,
    isLoading,
    error,
    fetchMessages,
    handleSendMessage
  } = useChatMessages(currentUserId);
  
  const {
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    selectConversation
  } = useConversationManager(currentUserId);
  
  const { showWelcome, setShowWelcome } = useWelcomeState(currentConversationId);
  const { handleCopyMessage } = useChatClipboard();
  
  const conversationIdFromParams = searchParams.get('conversationId');
  
  // Handle question selection - modified to only populate the input
  // without automatically sending the message
  const { handleSelectQuestion } = useQuestionHandler(
    currentConversationId,
    createNewConversation,
    handleSendMessage
  );

  // Load conversation from URL params
  useEffect(() => {
    if (conversationIdFromParams) {
      setCurrentConversationId(conversationIdFromParams);
      fetchMessages(conversationIdFromParams);
    }
  }, [conversationIdFromParams, fetchMessages, setCurrentConversationId]);

  // Handle conversation selection from sidebar
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    fetchMessages(conversationId);
  };

  // Handle new chat button click
  const handleNewChat = async () => {
    if (!currentUserId) return;
    
    const newConversationId = await createNewConversation(currentUserId);
    if (newConversationId) {
      setCurrentConversationId(newConversationId);
      // This was causing the error - we don't have setMessages in this component
      // setMessages([]);
      setShowWelcome(true);
    }
  };

  // Handle sending a message with proper Promise return
  const handleMessageSend = async (content: string): Promise<void> => {
    console.log("Chat page: handleMessageSend called with content:", content);
    
    if (!currentConversationId) {
      // If no conversation exists yet, create one first
      if (!currentUserId) return Promise.reject(new Error("No user ID"));
      
      console.log("Creating new conversation for message");
      const newConversationId = await createNewConversation(currentUserId);
      if (newConversationId) {
        console.log("New conversation created:", newConversationId);
        setCurrentConversationId(newConversationId);
        setShowWelcome(false);
        return handleSendMessage(content, newConversationId);
      }
      return Promise.reject(new Error("Failed to create conversation"));
    }
    
    // Use existing conversation
    console.log("Using existing conversation:", currentConversationId);
    setShowWelcome(false);
    return handleSendMessage(content, currentConversationId);
  };

  // Proper Promise-returning wrapper function for handleCopyMessage
  const handleCopyMessageWrapper = async (content: string): Promise<void> => {
    return handleCopyMessage(content);
  };
  
  // Handle question selection - just set the text in the input box
  // without automatically sending the message
  const handleQuestionSelect = (question: string) => {
    console.log("Question selected:", question);
    setSelectedQuestion(question);
  };

  // Log current state to help with debugging
  useEffect(() => {
    console.log("[Chat] Rendering with state:", {
      currentUserId,
      messagesCount: messages.length,
      isLoading,
      currentConversationId,
      showWelcome
    });
  }, [currentUserId, messages.length, isLoading, currentConversationId, showWelcome]);

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-1 overflow-hidden">
        <ChatLayout
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
        >
          <ChatContent
            messages={messages}
            currentUserId={currentUserId}
            isLoading={isLoading}
            onSendMessage={handleMessageSend}
            onNewChat={handleNewChat}
            error={error}
            showWelcome={showWelcome}
            currentConversationId={currentConversationId}
            isChatDisabled={false}
          >
            <div className="flex flex-col h-full">
              <ChatContainer
                messages={messages}
                currentUserId={currentUserId || ""}
                isLoading={isLoading}
                onCopyMessage={handleCopyMessageWrapper}
                onSelectQuestion={handleQuestionSelect}
              />
              <ChatInput 
                onSendMessage={handleMessageSend}
                isLoading={isLoading}
                selectedQuestion={selectedQuestion}
                disabled={false}
              />
            </div>
          </ChatContent>
        </ChatLayout>
      </div>
    </div>
  );
}
