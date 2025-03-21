
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    <div className="flex h-full w-full overflow-hidden">
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
