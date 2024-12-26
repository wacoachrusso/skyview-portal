import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ChatSidebar } from "../ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

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
    <div className="flex h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      {!isMobile && (
        <ChatSidebar 
          onSelectConversation={onSelectConversation}
          currentConversationId={currentConversationId}
        />
      )}
      <div className="flex-1 flex flex-col h-full">
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg">
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
        )}
        {children}
      </div>
    </div>
  );
}