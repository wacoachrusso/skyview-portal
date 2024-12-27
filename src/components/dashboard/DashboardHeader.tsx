import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-foreground/90">
              SkyGuide
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-foreground/70" />
              <span className="text-sm font-medium text-foreground/70 hidden sm:block">
                {userEmail}
              </span>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onSignOut}
              className="bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};