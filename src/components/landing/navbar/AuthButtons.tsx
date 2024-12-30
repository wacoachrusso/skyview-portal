import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, LogOut, MessageSquare, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthButtonsProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  scrollToPricing: () => void;
  isMobile?: boolean;
  showChatOnly?: boolean;
}

export function AuthButtons({ isLoading, isLoggedIn, scrollToPricing, isMobile, showChatOnly }: AuthButtonsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process from navbar...");
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      console.log("Logout successful, clearing local storage...");
      localStorage.clear();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 bg-gray-700 animate-pulse rounded"></div>
        <div className="h-9 w-20 bg-gray-700 animate-pulse rounded"></div>
      </div>
    );
  }

  if (isLoggedIn) {
    // If showChatOnly is true, only show the chat button
    if (showChatOnly) {
      return (
        <Button 
          asChild
          variant="ghost"
          size="sm"
          className="text-foreground hover:bg-accent"
        >
          <Link to="/chat">
            <MessageSquare className="h-5 w-5" />
          </Link>
        </Button>
      );
    }

    return (
      <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
        <Button 
          asChild
          variant={isMobile ? "ghost" : "secondary"}
          size="sm"
          className={`${isMobile ? 'w-full justify-start' : ''} hover:bg-accent`}
        >
          <Link to="/account">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </Button>
        
        {!isMobile && <NotificationBell />}
        
        <Button 
          asChild
          size="sm"
          variant={isMobile ? "ghost" : "default"}
          className={`${isMobile ? 'w-full justify-start' : ''} hover:bg-accent`}
        >
          <Link to="/dashboard">
            Dashboard
          </Link>
        </Button>

        <Button 
          onClick={handleLogout}
          size="sm"
          variant={isMobile ? "ghost" : "destructive"}
          className={`${isMobile ? 'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10' : ''}`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
      <Button 
        asChild 
        variant={isMobile ? "ghost" : "secondary"}
        size="sm"
        className={`${isMobile ? 'w-full justify-start' : ''} hover:bg-accent`}
      >
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Link>
      </Button>
      <Button 
        onClick={scrollToPricing}
        size="sm"
        variant={isMobile ? "ghost" : "default"}
        className={`${isMobile ? 'w-full justify-start' : ''} hover:bg-accent`}
      >
        Sign Up
      </Button>
    </div>
  );
}