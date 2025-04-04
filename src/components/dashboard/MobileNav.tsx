
import { Link } from "react-router-dom";
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
  return (
    <div className="flex md:hidden items-center space-x-2">
      <div className="flex items-center space-x-1">
        <NotificationBell />
        <Button 
          asChild
          variant="ghost"
          size="icon"
          className="text-foreground/70 hover:text-foreground w-8 h-8"
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
            className="text-foreground/70 hover:text-foreground w-8 h-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 sm:w-56 bg-background/95 backdrop-blur-sm border border-border"
        >
          {!isAccountPage && (
            <DropdownMenuItem asChild>
              <Link to="/account" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Account
              </Link>
            </DropdownMenuItem>
          )}
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
  );
};
