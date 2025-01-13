import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MessageSquare, LogOut, LayoutDashboard } from "lucide-react";
import { ChatSidebar } from "../ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthManagement } from "@/hooks/useAuthManagement";

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
  const navigate = useNavigate();
  const { handleSignOut } = useAuthManagement();

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
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <SheetContent side="left" className="p-0 w-[280px] bg-background border-r border-border">
              <div className="flex flex-col h-full">
                <ChatSidebar 
                  onSelectConversation={(id) => {
                    onSelectConversation(id);
                    setIsSidebarOpen(false);
                  }}
                  currentConversationId={currentConversationId}
                />
                <div className="mt-auto p-4 border-t border-border">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        {children}
      </div>
    </div>
  );
}