import { useNavigate } from "react-router-dom";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatList } from "@/components/chat/ChatList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";

export default function Chat() {
  const navigate = useNavigate();
  const { messages, currentUserId, isLoading, sendMessage, createNewConversation } = useChat();

  const handleNewChat = async () => {
    if (!currentUserId) {
      console.error('No current user ID available for new chat');
      return;
    }
    await createNewConversation(currentUserId);
  };

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <ChatHeader onBack={() => navigate('/')} onNewChat={handleNewChat} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <p className="text-lg">Ask me anything about your contract and I'll help you understand it...</p>
              </div>
            )}
            <ChatList 
              messages={messages} 
              currentUserId={currentUserId || ''} 
            />
          </div>
          <ChatInput 
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}