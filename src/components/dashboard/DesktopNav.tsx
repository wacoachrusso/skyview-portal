
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, MessageSquare } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface DesktopNavProps {
  isAccountPage: boolean;
  onSignOut: () => Promise<void>;
}

export const DesktopNav = ({ isAccountPage, onSignOut }: DesktopNavProps) => {
  const location = useLocation();
  const isChatActive = location.pathname === '/chat';
  
  return (
    <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
      <div className="flex items-center space-x-2">
        <NotificationBell />
        <Button 
          asChild
          variant="secondary"
          size="sm"
          className={`transition-all duration-300 ${
            isChatActive 
              ? "bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 hover:text-black border border-brand-gold/50" 
              : "text-white hover:bg-brand-gold hover:text-black"
          }`}
        >
          <Link to="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Ask SkyGuide</span>
          </Link>
        </Button>
      </div>
      {!isAccountPage && (
        <Button 
          asChild
          variant="secondary"
          size="sm"
          className={`transition-all duration-300 ${
            location.pathname === '/account'
              ? "bg-accent/80 text-accent-foreground"
              : "text-white hover:bg-accent/60 hover:text-accent-foreground"
          }`}
        >
          <Link to="/account">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Account</span>
          </Link>
        </Button>
      )}
      <Button 
        variant="secondary" 
        size="sm"
        onClick={onSignOut}
        className="bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:text-destructive transition-colors duration-300"
      >
        <LogOut className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline">Sign Out</span>
      </Button>
    </div>
  );
};
