import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MessageSquare } from "lucide-react";
import { ChatSidebar } from "../ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/button";

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
    <div className="flex h-full">
      {!isMobile && (
        <div className="w-64 sm:w-80 flex-shrink-0 border-r border-border">
          <ChatSidebar 
            onSelectConversation={onSelectConversation}
            currentConversationId={currentConversationId}
          />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-background">
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-accent/50 rounded-lg">
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Button 
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <SheetContent side="left" className="p-0 w-[280px] bg-background border-r border-border">
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