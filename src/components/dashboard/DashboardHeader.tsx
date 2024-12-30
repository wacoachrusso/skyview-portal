import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, MessageSquare } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromDashboard: true } });
  };

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <a 
              href="/"
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                alt="SkyGuide Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-semibold text-foreground/90">
                SkyGuide
              </span>
            </a>
          </div>
          
          {/* Navigation Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              asChild
              variant="secondary"
              size="sm"
              className="text-white hover:bg-brand-gold hover:text-black"
            >
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chat Now</span>
              </Link>
            </Button>
            <Button 
              asChild
              variant="secondary"
              size="sm"
              className="text-white hover:bg-brand-gold hover:text-black"
            >
              <Link to="/account">
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </Link>
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Chat Button - Always visible on mobile */}
            <Button 
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:text-foreground"
            >
              <Link to="/chat">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>

            {/* Notification Bell */}
            <NotificationBell />
            
            {/* Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-background/95 backdrop-blur-sm border border-border"
              >
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={onSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-3">
            <NotificationBell />
            <div className="hidden lg:flex items-center space-x-2">
              <User className="h-5 w-5 text-foreground/70" />
              <span className="text-sm font-medium text-foreground/70">
                {userEmail}
              </span>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onSignOut}
              className="bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};