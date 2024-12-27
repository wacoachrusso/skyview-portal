import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  onNewChat: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ onNewChat, onBack, showBackButton = false }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex items-center gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
      </div>
    </header>
  );
}