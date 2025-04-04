
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, MessageSquare } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface DesktopNavProps {
  isAccountPage: boolean;
  onSignOut: () => Promise<void>;
}

export const DesktopNav = ({ isAccountPage, onSignOut }: DesktopNavProps) => {
  return (
    <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
      <div className="flex items-center space-x-2">
        <NotificationBell />
        <Button 
          asChild
          variant="secondary"
          size="sm"
          className="hidden sm:flex text-white hover:bg-brand-gold hover:text-black"
        >
          <Link to="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Ask SkyGuide</span>
          </Link>
        </Button>
        <Button 
          asChild
          variant="ghost"
          size="icon"
          className="sm:hidden text-foreground/70 hover:text-foreground"
        >
          <Link to="/chat">
            <MessageSquare className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      {!isAccountPage && (
        <Button 
          asChild
          variant="secondary"
          size="sm"
          className="text-white hover:bg-brand-gold hover:text-black"
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
        className="bg-secondary/80 text-secondary-foreground hover:bg-secondary"
      >
        <LogOut className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline">Sign Out</span>
      </Button>
    </div>
  );
};
