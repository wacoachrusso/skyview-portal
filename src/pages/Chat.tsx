import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatContent } from "@/components/chat/ChatContent";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    cleanup 
  } = useChat();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();

    // Cleanup function for chat resources
    return () => {
      console.log('Cleaning up chat resources');
      cleanup?.();
    };
  }, [navigate, cleanup]);

  // Log navigation attempts
  useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Loading conversation:', conversationId);
    await loadConversation(conversationId);
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false);
  };

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
          onSendMessage={sendMessage}
          onNewChat={startNewChat}
        />
      </ChatLayout>
    </div>
  );
};

export default Chat;