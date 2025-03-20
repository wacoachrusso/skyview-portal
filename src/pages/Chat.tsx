
import { useEffect, useState, useCallback } from "react";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { useChat } from "@/hooks/useChat";
import { ChatContent } from "@/components/chat/ChatContent";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";
import { useQueryCounter } from "@/hooks/useQueryCounter";
import { useDisclaimerDialog } from "@/hooks/useDisclaimerDialog";
import { useChatAccess } from "@/hooks/useChatAccess";
import { useIsMobile } from "@/hooks/use-mobile";

const Chat = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    messages,
    isLoading,
    sendMessage,
    currentUserId,
    startNewChat,
    userProfile,
  } = useChat();

  // Use our custom hooks
  const { isChatDisabled: accessDisabled } = useChatAccess(currentUserId);
  const { isChatDisabled: counterDisabled, incrementQueryCount } = useQueryCounter(currentUserId, userProfile);
  const { 
    showDisclaimer, 
    handleAcceptDisclaimer, 
    handleRejectDisclaimer,
    checkDisclaimerStatus
  } = useDisclaimerDialog(currentUserId);

  // Combine disabled states
  const isChatDisabled = accessDisabled || counterDisabled;

  // Check disclaimer status when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      checkDisclaimerStatus();
    }
  }, [currentUserId, checkDisclaimerStatus]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      console.log("Loading conversation:", conversationId);
      await loadConversation(conversationId);
      setCurrentConversationId(conversationId);
      setIsSidebarOpen(false);
    },
    [loadConversation, setCurrentConversationId]
  );

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (isChatDisabled) {
        return; // Do nothing if chat is disabled
      }

      // Send the message
      await sendMessage(message);

      // Increment query count and check if it reaches the limit
      if (currentUserId) {
        await incrementQueryCount(currentUserId);
      } else {
        console.error("currentUserId is not set");
      }
    },
    [sendMessage, currentUserId, incrementQueryCount, isChatDisabled]
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C] overflow-hidden">
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
          onNewChat={startNewChat}
          isChatDisabled={isChatDisabled}
        />
      </ChatLayout>
      
      <DisclaimerDialog 
        open={showDisclaimer} 
        onAccept={handleAcceptDisclaimer} 
        onReject={handleRejectDisclaimer} 
      />
    </div>
  );
};

export default Chat;
