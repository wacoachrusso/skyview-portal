
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, MessageSquare, Menu } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileNavProps {
  isAccountPage: boolean;
  onSignOut: () => Promise<void>;
}

export const MobileNav = ({ isAccountPage, onSignOut }: MobileNavProps) => {
  const location = useLocation();
  const isChatActive = location.pathname === '/chat';
  
  return (
    <div className="flex md:hidden items-center space-x-2">
      <div className="flex items-center space-x-1">
        <NotificationBell />
        <Button 
          asChild
          variant="ghost"
          size="icon"
          className={`text-foreground/70 hover:text-foreground w-8 h-8 transition-colors ${
            isChatActive ? "bg-brand-gold/10 text-brand-gold ring-1 ring-brand-gold/30" : ""
          }`}
        >
          <Link to="/chat">
            <MessageSquare className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-foreground/70 hover:text-foreground hover:bg-accent/50 w-8 h-8 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 sm:w-56 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg p-1 rounded-lg"
        >
          {!isAccountPage && (
            <DropdownMenuItem asChild className={`rounded-md my-1 px-3 py-2 ${location.pathname === '/account' ? "bg-accent/50" : ""}`}>
              <Link to="/account" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Account
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive hover:bg-destructive/10 rounded-md my-1 px-3 py-2"
            onClick={onSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
