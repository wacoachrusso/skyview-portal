import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ChatSidebar } from "../ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

interface ChatLayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export function ChatLayout({
  children,
  isSidebarOpen,
  setIsSidebarOpen,
  onSelectConversation,
  currentConversationId,
}: ChatLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      {!isMobile && (
        <ChatSidebar 
          onSelectConversation={onSelectConversation}
          currentConversationId={currentConversationId}
        />
      )}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {isMobile && (
          <div className="flex items-center">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-lg absolute top-2 left-2 z-10">
                  <Menu className="h-6 w-6 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-[#1A1F2C]">
                <ChatSidebar 
                  onSelectConversation={onSelectConversation}
                  currentConversationId={currentConversationId}
                />
              </SheetContent>
            </Sheet>
            <Link 
              to="/" 
              className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png" 
                alt="SkyGuide Logo" 
                className="h-8 w-auto"
              />
              <span className="text-white text-xl font-bold">SkyGuide</span>
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}