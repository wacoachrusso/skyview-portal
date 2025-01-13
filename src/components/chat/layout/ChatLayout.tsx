import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MessageSquare, Bell, User, LogOut } from "lucide-react";
import { ChatSidebar } from "../ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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
          <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/50 rounded-lg">
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[280px] bg-background border-l border-border">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col space-y-3">
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/dashboard">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/account">
                        <User className="mr-2 h-4 w-4" />
                        Account
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
                <ChatSidebar 
                  onSelectConversation={(id) => {
                    onSelectConversation(id);
                    setIsSidebarOpen(false);
                  }}
                  currentConversationId={currentConversationId}
                />
              </SheetContent>
            </Sheet>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}