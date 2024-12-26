import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatList } from "@/components/chat/ChatList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
    createNewConversation,
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
    const loadedMessages = await loadConversation(conversationId);
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

  const renderWelcomeMessage = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <img 
          src="/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png" 
          alt="SkyGuide Logo" 
          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
        />
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Welcome to SkyGuide Chat</h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto">
            Ask me anything about your contract and I'll help you understand it better.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      {!isMobile && (
        <ChatSidebar 
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
        />
      )}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex items-center">
          {isMobile && (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-lg">
                  <Menu className="h-6 w-6 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-[#1A1F2C]">
                <ChatSidebar 
                  onSelectConversation={handleSelectConversation}
                  currentConversationId={currentConversationId}
                />
              </SheetContent>
            </Sheet>
          )}
          <div className="flex-1">
            <ChatHeader 
              onBack={() => navigate('/')} 
              onNewChat={handleNewChat}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto">
            {(messages.length === 0 && !isLoading) && renderWelcomeMessage()}
            <ChatList 
              messages={messages} 
              currentUserId={currentUserId || ''} 
              isLoading={isLoading}
            />
          </div>
          <div className="sticky bottom-0 w-full bg-[#1A1F2C] border-t border-white/10">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}