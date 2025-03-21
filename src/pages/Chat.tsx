
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
            onSendMessage={handleMessageSend}
            onNewChat={handleNewChat}
            error={error}
            showWelcome={showWelcome}
            currentConversationId={currentConversationId}
          >
            <ChatContainer
              messages={messages}
              currentUserId={currentUserId}
              isLoading={isLoading}
              onCopyMessage={handleCopyMessage}
              onSelectQuestion={handleSelectQuestion}
            />
          </ChatContent>
        </ChatLayout>
      </div>
    </div>
  );
}
