import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";

export const NavigationButtons = () => {
  const location = useLocation();

  const getButtonsForCurrentRoute = () => {
    const buttons = [];
    
    if (location.pathname !== '/chat') {
      buttons.push(
        <Button 
          key="chat"
          asChild
          variant="secondary"
          size="sm"
          className="text-white hover:bg-brand-gold hover:text-black"
        >
          <Link to="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat Now
          </Link>
        </Button>
      );
    }
    
    if (location.pathname !== '/account') {
      buttons.push(
        <Button 
          key="account"
          asChild
          variant="secondary"
          size="sm"
          className="text-white hover:bg-brand-gold hover:text-black"
        >
          <Link to="/account">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </Button>
      );
    }
    
    if (location.pathname !== '/dashboard') {
      buttons.push(
        <Button 
          key="dashboard"
          asChild
          size="sm"
          className="bg-brand-gold text-black hover:bg-brand-gold/90"
        >
          <Link to="/dashboard">
            Dashboard
          </Link>
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="flex items-center gap-3">
      {getButtonsForCurrentRoute()}
    </div>
  );
};