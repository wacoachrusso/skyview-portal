
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  UserCircle, 
  PlusCircle, 
  LogOut, 
  Menu 
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { forceNavigate } from "@/utils/navigation";

export function ChatNavbar() {
  const { handleLogout } = useLogout();
  const isMobile = useIsMobile();
  
  // Handle custom sign out to clear cached data
  const handleSignOut = async () => {
    try {
      // Clear cached data on sign out
      sessionStorage.removeItem("cached_user_profile");
      sessionStorage.removeItem("cached_auth_user");
      handleLogout();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm py-3 px-4">
      <div className="flex items-center justify-between">
        {/* Logo section */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
              alt="SkyGuide Logo" 
              className="h-8 w-auto"
              style={{ 
                mixBlendMode: 'lighten', 
                filter: 'drop-shadow(0 0 0 transparent)'
              }}
            />
          </div>
          <span className="text-lg font-semibold text-foreground/90 hidden sm:inline-block">
            SkyGuide
          </span>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => forceNavigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
              onClick={(e) => e.preventDefault()}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Contract
            </Button>
            
            <PlusCircleButton />
            
            <NotificationBell />
            
            <Button
              onClick={() => forceNavigate('/account')}
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Account
            </Button>
            
            <Button
              onClick={() => handleLogout()}
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center gap-3">
            <PlusCircleButton />
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => forceNavigate('/dashboard')} className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.preventDefault()} className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  View Contract
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => forceNavigate('/account')} className="flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSignOut()}
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}

// Helper component for new chat button
function PlusCircleButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10"
      onClick={(e) => {
        e.preventDefault();
        // Use the force navigate function to create a new chat
        forceNavigate('/chat');
      }}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      New Chat
    </Button>
  );
}
