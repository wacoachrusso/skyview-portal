import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatContent } from "@/components/chat/ChatContent";

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
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-50 flex gap-3">
        <Button 
          variant="ghost" 
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        <Button 
          variant="ghost" 
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
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
  );
};

export default Chat;