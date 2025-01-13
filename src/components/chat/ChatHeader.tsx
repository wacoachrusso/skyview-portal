import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard, FileText, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useContractHandler } from "@/hooks/useContractHandler";
import { useAuthManagement } from "@/hooks/useAuthManagement";

interface ChatHeaderProps {
  onNewChat: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ onNewChat, onBack, showBackButton = false }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { handleContractClick } = useContractHandler();
  const { handleSignOut } = useAuthManagement();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-top">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>
        )}
        <div className="flex flex-col items-start">
          <h1 className="text-lg font-semibold text-foreground leading-none"></h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleContractClick}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <FileText className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">View Contract</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Dashboard</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">New Chat</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Logout</span>
        </Button>
      </div>
    </header>
  );
}