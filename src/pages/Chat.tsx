import { useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatList } from "@/components/chat/ChatList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    createNewConversation,
    currentConversationId,
    loadConversation,
    setCurrentConversationId
  } = useChat();

  const handleBack = () => {
    setShowSidebar(true);
  };

  const handleNewChat = async () => {
    console.log("Creating new chat...");
    const newConversationId = await createNewConversation();
    console.log("New conversation created with ID:", newConversationId);
    if (newConversationId) {
      setCurrentConversationId(newConversationId);
      setShowSidebar(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {showSidebar && (
        <ChatSidebar
          onSelectConversation={(id) => {
            loadConversation(id);
            setShowSidebar(false);
          }}
          currentConversationId={currentConversationId}
        />
      )}
      <div className="flex-1 flex flex-col">
        <ChatHeader onBack={handleBack} onNewChat={handleNewChat} />
        <div className="flex-1 overflow-y-auto">
          <ChatList messages={messages} isLoading={isLoading} />
        </div>
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}