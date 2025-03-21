
import { Link } from "react-router-dom";
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

export function ChatNavbar() {
  const { handleLogout } = useLogout();
  const isMobile = useIsMobile();
  
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm py-3 px-4">
      <div className="flex items-center justify-between">
        {/* Logo section */}
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold text-foreground/90 hidden sm:inline-block">
            SkyGuide
          </span>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
            >
              <Link to="#" onClick={(e) => e.preventDefault()}>
                <FileText className="mr-2 h-4 w-4" />
                View Contract
              </Link>
            </Button>
            
            <PlusCircleButton />
            
            <NotificationBell />
            
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:text-foreground"
            >
              <Link to="/account">
                <UserCircle className="mr-2 h-4 w-4" />
                Account
              </Link>
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
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="#" onClick={(e) => e.preventDefault()} className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    View Contract
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleLogout()}
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
  const navigate = useNavigate();
  
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10"
    >
      <Link to="#" onClick={(e) => {
        e.preventDefault();
        // Use React Router navigation instead of window.location for smoother transition
        navigate('/chat');
      }}>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Chat
      </Link>
    </Button>
  );
}
