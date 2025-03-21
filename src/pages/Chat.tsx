
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { OfflineAlert } from "@/components/chat/OfflineAlert";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { TrialEndedState } from "@/components/chat/TrialEndedState";
import { ChatContent } from "@/components/chat/ChatContent";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export default function Chat() {
  const {
    messages,
    currentUserId,
    isLoading,
    sendMessage,
    startNewChat,
    userProfile,
    currentConversationId,
    setCurrentConversationId
  } = useChat();

  const { isOffline } = useOfflineStatus();
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();

  const handleCopyMessage = (content: string) => {
    copyToClipboard(content);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    setSelectedQuestion(""); // Reset selected question after sending
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  // Determine if the user is on a free plan and has exhausted their queries
  const isFreeTrialExhausted =
    userProfile?.subscription_plan === "free" && 
    (userProfile?.query_count || 0) >= 2;

  return (
    <ChatLayout 
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      onSelectConversation={handleSelectConversation}
      currentConversationId={currentConversationId}
    >
      <ChatContent
        messages={messages}
        currentUserId={currentUserId || ""}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onNewChat={startNewChat}
        isChatDisabled={isFreeTrialExhausted}
      >
        {isOffline ? (
          <OfflineAlert />
        ) : isFreeTrialExhausted ? (
          <TrialEndedState />
        ) : (
          <div className="flex flex-col h-full">
            <ChatContainer
              messages={messages}
              currentUserId={currentUserId || ""}
              isLoading={isLoading}
              onCopyMessage={handleCopyMessage}
              onSelectQuestion={setSelectedQuestion}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              queryCount={userProfile?.query_count || 0}
              subscriptionPlan={userProfile?.subscription_plan}
              selectedQuestion={selectedQuestion}
            />
          </div>
        )}
      </ChatContent>
    </ChatLayout>
  );
}
