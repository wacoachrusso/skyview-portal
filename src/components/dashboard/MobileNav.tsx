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
    <div className="flex md:hidden items-center space-x-3">
      <div className="flex items-center space-x-2">
        <NotificationBell />
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
      </div>
      
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