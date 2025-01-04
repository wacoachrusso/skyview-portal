import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useContractHandler } from "@/hooks/useContractHandler";

interface ChatHeaderProps {
  onNewChat: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ onNewChat, onBack, showBackButton = false }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { handleContractClick } = useContractHandler();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <h1 className="text-lg font-semibold text-foreground leading-none">SkyGuide AI</h1>
          <span className="text-xs text-muted-foreground mt-1">Your Contract Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 hidden sm:flex items-center gap-2 ml-4"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
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
          onClick={onNewChat}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">New Chat</span>
        </Button>
      </div>
    </header>
  );
}