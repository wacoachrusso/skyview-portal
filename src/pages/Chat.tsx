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
    loadConversation 
  } = useChat();

  const handleNewChat = async () => {
    console.log('Creating new chat...');
    if (currentUserId) {
      const newConversationId = await createNewConversation(currentUserId);
      if (newConversationId) {
        console.log('New conversation created:', newConversationId);
        await loadConversation(newConversationId);
      }
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
            {messages.length === 0 && !isLoading && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                  <div className="inline-block p-6 rounded-full bg-gradient-to-br from-[#2A2F3C] to-[#1A1F2C]">
                    <svg
                      className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500"
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
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Welcome to SkyGuide Chat</h2>
                  <p className="text-sm sm:text-base text-gray-400 max-w-sm mx-auto">
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
          </div>
          <div className="sticky bottom-0 w-full bg-[#1A1F2C] border-t border-white/10">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}