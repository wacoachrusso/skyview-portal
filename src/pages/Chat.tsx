import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatContent } from "@/components/chat/ChatContent";
import { ContractUpload } from "@/components/chat/ContractUpload";

const Chat = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    currentConversationId, 
    loadConversation, 
    setCurrentConversationId,
    messages,
    isLoading,
    sendMessage,
    currentUserId 
  } = useChat();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSelectConversation = async (conversationId: string) => {
    await loadConversation(conversationId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-[#1A1F2C] border-b border-white/10">
        <div className="flex items-center gap-4">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/', { state: { fromChat: true } });
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-8 w-auto"
            />
            <span className="text-white font-semibold text-base">Ask SkyGuide</span>
          </a>
          <ContractUpload />
        </div>
        <Button 
          variant="ghost" 
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
      </header>
      <div className="pt-14"> {/* Adjusted padding to account for fixed header */}
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
          />
        </ChatLayout>
      </div>
    </div>
  );
};

export default Chat;