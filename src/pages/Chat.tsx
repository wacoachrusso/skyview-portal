
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatNavbar } from "@/components/chat/layout/ChatNavbar";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChatContent } from "@/components/chat/ChatContent";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useConversationManager } from "@/hooks/useConversationManager";
import { useWelcomeState } from "@/hooks/useWelcomeState";
import { useChatClipboard } from "@/utils/clipboardUtils";
import { useQuestionHandler } from "@/hooks/useQuestionHandler";
import { useState } from 'react';
import { ChatInput } from "@/components/chat/ChatInput";

export default function Chat() {
  const { currentUserId } = useUserProfile();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
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
  
  const { showWelcome } = useWelcomeState(currentConversationId);
  const { handleCopyMessage } = useChatClipboard();
  
  const conversationIdFromParams = searchParams.get('conversationId');
  
  // Handle question selection
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
  const handleNewChat = () => {
    createNewConversation();
  };

  // Handle sending a message
  const handleMessageSend = (content: string) => {
    if (currentConversationId) {
      handleSendMessage(content, currentConversationId);
    }
  };

  // Proper Promise-returning wrapper function for handleCopyMessage
  const handleCopyMessageWrapper = async (content: string): Promise<void> => {
    return handleCopyMessage(content);
  };

  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  
  // Handle question selection with state update
  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    handleSelectQuestion(question);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatNavbar />
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
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            error={error}
            showWelcome={showWelcome}
            currentConversationId={currentConversationId}
          >
            <div className="flex flex-col h-full">
              <ChatContainer
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoading}
                onCopyMessage={handleCopyMessageWrapper}
                onSelectQuestion={handleQuestionSelect}
              />
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                selectedQuestion={selectedQuestion}
              />
            </div>
          </ChatContent>
        </ChatLayout>
      </div>
    </div>
  );
}
