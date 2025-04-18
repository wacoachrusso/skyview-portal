
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { Icons } from "@/components/icons";
import { forceNavigate } from "@/utils/navigation";

interface ChatHeaderProps {
  onNewChat: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
}

export function ChatHeader({ onNewChat, onBack, showBackButton = false, isLoading = false }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const { handleLogout } = useLogout();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>
        )}
        <div className={`hidden items-center gap-2 ${isMobile ? 'ml-10' : ''}`}>
          <div className="items-center justify-center">
            <img 
              src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
              alt="SkyGuide Logo" 
              className="h-7 w-auto premium-logo-glow transition-all duration-300"
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground leading-none gradient-text">SkyGuide</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isLoading && <Icons.spinner className="h-4 w-4 mr-2 text-brand-gold" />}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => forceNavigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Dashboard</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => forceNavigate('/account')}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center transition-colors"
        >
          <UserCircle className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Account</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNewChat}
          className="text-secondary-foreground bg-secondary/90 hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">New Chat</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Logout</span>
        </Button>
      </div>
    </header>
  );
}
