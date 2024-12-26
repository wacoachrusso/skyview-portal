import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChatContent } from "@/components/chat/ChatContent";

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { 
    messages, 
    currentUserId, 
    isLoading, 
    sendMessage, 
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    startNewChat 
  } = useChat();

  const handleNewChat = async () => {
    console.log('Creating new chat...');
    await startNewChat();
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Selecting conversation:', conversationId);
    await loadConversation(conversationId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to login");
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive",
          duration: 2000
        });
        navigate('/login');
        return;
      }
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          console.log("Auth state changed: no session, redirecting to login");
          navigate('/login');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkAuth();
  }, [navigate, toast]);

  return (
    <ChatLayout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      onSelectConversation={handleSelectConversation}
      currentConversationId={currentConversationId}
    >
      <div className="flex flex-col h-full">
        <div className="flex-none">
          <ChatHeader 
            onBack={() => navigate('/')} 
            onNewChat={handleNewChat}
          />
        </div>
        <ChatContent
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
      </div>
    </ChatLayout>
  );
}