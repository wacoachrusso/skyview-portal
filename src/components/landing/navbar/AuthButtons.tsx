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
      
      // First clear all local storage
      localStorage.clear();
      
      // Then sign out from Supabase with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' 
      });
      
      if (error) {
        console.error("Error during logout:", error);
        throw error;
      }
      
      console.log("Successfully logged out");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Navigate after successful logout
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      
      // Even if there's an error, ensure we clear local state and redirect
      localStorage.clear();
      navigate('/login', { replace: true });
      
      toast({
        title: "Session ended",
        description: "Your session has been cleared",
        variant: "default",
      });
    }
  };

  // Show loading skeleton based on device type
  if (isLoading) {
    if (isMobile) {
      return (
        <div className="w-full py-2">
          <div className="h-9 bg-gray-700/20 animate-pulse rounded"></div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 bg-gray-700/20 animate-pulse rounded"></div>
        <div className="h-9 w-20 bg-gray-700/20 animate-pulse rounded"></div>
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
        {!isMobile && <NotificationBell />}
        
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