
import { useState } from "react";
import { useClipboard } from "@chakra-ui/hooks";
import { useChat } from "@/hooks/useChat";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { OfflineAlert } from "@/components/chat/OfflineAlert";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { TrialEndedState } from "@/components/chat/TrialEndedState";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatContent } from "@/components/chat/ChatContent";

export default function Chat() {
  const {
    messages,
    currentUserId,
    isLoading,
    sendMessage,
    startNewChat,
    userProfile,
  } = useChat();

  const { isOffline } = useOfflineStatus();
  const { onCopy } = useClipboard();
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");

  const handleCopyMessage = (content: string) => {
    onCopy(content);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  // Determine if the user is on a free plan and has exhausted their queries
  const isFreeTrialExhausted =
    userProfile?.subscription_plan === "free" && 
    (userProfile?.query_count || 0) >= 2;

  return (
    <ChatLayout>
      <ChatSidebar 
        startNewChat={startNewChat} 
        userProfile={userProfile}
      />
      <ChatContent>
        {isOffline ? (
          <OfflineAlert />
        ) : isFreeTrialExhausted ? (
          <TrialEndedState />
        ) : (
          <>
            <ChatContainer
              messages={messages}
              currentUserId={currentUserId}
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
          </>
        )}
      </ChatContent>
    </ChatLayout>
  );
}
