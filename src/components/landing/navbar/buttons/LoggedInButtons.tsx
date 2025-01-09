import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface LoggedInButtonsProps {
  isMobile: boolean;
  showChatOnly?: boolean;
  handleLogout: () => void;
}

export const LoggedInButtons = ({ isMobile, showChatOnly, handleLogout }: LoggedInButtonsProps) => {
  if (showChatOnly) {
    return (
      <Button 
        asChild
        variant="ghost"
        size="sm"
        className="text-foreground hover:bg-accent"
      >
        <Link to="/chat">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
      {!isMobile && <NotificationBell />}
      
      <Button 
        asChild
        variant={isMobile ? "ghost" : "secondary"}
        size="sm"
        className={`${isMobile ? 'w-full justify-start' : 'bg-brand-slate hover:bg-brand-slate/90'}`}
      >
        <Link to="/account">
          <User className="mr-2 h-4 w-4" />
          Account
        </Link>
      </Button>
      
      <Button 
        asChild
        size="sm"
        variant={isMobile ? "ghost" : "default"}
        className={`${isMobile ? 'w-full justify-start' : 'bg-brand-slate hover:bg-brand-slate/90'}`}
      >
        <Link to="/dashboard">
          Dashboard
        </Link>
      </Button>

      <Button 
        onClick={handleLogout}
        size="sm"
        variant={isMobile ? "ghost" : "destructive"}
        className={`${isMobile ? 'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10' : ''}`}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};