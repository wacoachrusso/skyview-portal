
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, Link } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { Icons } from "@/components/icons";

interface ChatHeaderProps {
  onNewChat: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
}

export function ChatHeader({ onNewChat, onBack, showBackButton = false, isLoading = false }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { handleLogout } = useLogout();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
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
        <div className={`flex items-center gap-2 ${isMobile ? 'ml-10' : ''}`}>
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-7 w-auto"
          />
          <h1 className="text-lg font-semibold text-foreground leading-none">SkyGuide</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isLoading && <Icons.spinner className="h-4 w-4 mr-2" />}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center"
        >
          <Link to="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            <span className="ml-2 hidden md:inline">Dashboard</span>
          </Link>
        </Button>
        {/* Add Account Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center"
        >
          <Link to="/account">
            <UserCircle className="h-4 w-4" />
            <span className="ml-2 hidden md:inline">Account</span>
          </Link>
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
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Logout</span>
        </Button>
      </div>
    </header>
  );
}
