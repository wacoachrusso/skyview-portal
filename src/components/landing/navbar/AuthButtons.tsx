import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, MessageSquare, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface AuthButtonsProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  scrollToPricing: () => void;
  isMobile?: boolean;
}

export function AuthButtons({ isLoading, isLoggedIn, scrollToPricing, isMobile }: AuthButtonsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 bg-gray-700 animate-pulse rounded"></div>
        <div className="h-9 w-20 bg-gray-700 animate-pulse rounded"></div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className={`flex items-center ${isMobile ? 'flex-col w-full gap-2' : 'gap-4'}`}>
        {/* Chat Button - Always visible */}
        <Button 
          asChild
          variant={isMobile ? "ghost" : "secondary"}
          size="sm"
          className={`${isMobile ? 'w-full justify-start' : ''} text-white hover:bg-brand-gold hover:text-black`}
        >
          <Link to="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat Now
          </Link>
        </Button>

        <Button 
          asChild
          variant={isMobile ? "ghost" : "secondary"}
          size="sm"
          className={`${isMobile ? 'w-full justify-start' : ''} text-white hover:bg-brand-gold hover:text-black`}
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
          className={`${isMobile ? 'w-full justify-start' : ''} hover:bg-brand-gold hover:text-black`}
        >
          <Link to="/dashboard">
            Dashboard
          </Link>
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
        className={`${isMobile ? 'w-full justify-start' : ''} text-white hover:bg-brand-gold hover:text-black`}
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
        className={`${isMobile ? 'w-full justify-start' : ''} hover:bg-brand-gold hover:text-black`}
      >
        Sign Up
      </Button>
    </div>
  );
}