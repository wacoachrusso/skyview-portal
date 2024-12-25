import { useNavigate } from "react-router-dom";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatList } from "@/components/chat/ChatList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";

export default function Chat() {
  const navigate = useNavigate();
  const { messages, currentUserId, isLoading, sendMessage, createNewConversation } = useChat();

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          onBack={() => navigate('/')} 
          onNewChat={() => {
            if (currentUserId) {
              createNewConversation(currentUserId);
            }
          }} 
        />
        <main className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-[#1E1E2E] to-[#2A2F3C]">
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-block p-6 rounded-full bg-gradient-to-br from-[#2A2F3C] to-[#1A1F2C]">
                  <svg
                    className="w-12 h-12 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Welcome to SkyGuide Chat</h2>
                <p className="text-gray-400 max-w-sm mx-auto">
                  Ask me anything about your contract and I'll help you understand it better.
                </p>
              </div>
            </div>
          )}
          <ChatList 
            messages={messages} 
            currentUserId={currentUserId || ''} 
            isLoading={isLoading}
          />
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}