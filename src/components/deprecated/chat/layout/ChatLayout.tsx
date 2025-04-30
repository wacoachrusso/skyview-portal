
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
    <div className="flex flex-1 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] overflow-hidden">
      {!isMobile && (
        <div className="w-64 sm:w-72 md:w-80 flex-shrink-0 border-r border-border/60 shadow-sm bg-gradient-to-b from-background to-background/95">
          <ChatSidebar 
            onSelectConversation={onSelectConversation}
            currentConversationId={currentConversationId}
          />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-background">
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-accent/50 rounded-lg absolute top-2 left-2 z-[100] bg-background/90 backdrop-blur-sm shadow-sm transition-all duration-300 border border-border/40 hover:-translate-y-0.5 hover:shadow-md">
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] bg-gradient-to-b from-background to-background/95 border-r border-border">
              <ChatSidebar 
                onSelectConversation={(id) => {
                  onSelectConversation(id);
                  setIsSidebarOpen(false);
                }}
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
