import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, MessageSquare, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface AuthButtonsProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  scrollToPricing: () => void;
}

export function AuthButtons({ isLoading, isLoggedIn, scrollToPricing }: AuthButtonsProps) {
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
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center">
          <div className="mr-4 sm:mr-6">
            <NotificationBell />
          </div>
          
          {/* Mobile View */}
          <div className="flex sm:hidden items-center gap-4">
            <Button 
              asChild
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
            >
              <Link to="/chat">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
            >
              <Link to="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          {/* Tablet/Desktop View */}
          <div className="hidden sm:flex items-center gap-6">
            <Button 
              asChild
              variant="secondary"
              size="sm"
              className="text-white hover:bg-brand-gold hover:text-black"
            >
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat Now
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
                Account
              </Link>
            </Button>
          </div>
        </div>
        
        <Button 
          asChild
          size="sm"
          className="bg-brand-gold text-black hover:bg-brand-gold/90 text-sm px-3 py-1"
        >
          <Link to="/dashboard">
            Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button 
        asChild 
        variant="secondary"
        size="sm"
        className="text-white hover:bg-brand-gold hover:text-black"
      >
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Login</span>
        </Link>
      </Button>
      <Button 
        onClick={scrollToPricing}
        size="sm"
        className="bg-brand-gold text-black hover:bg-brand-gold/90 text-sm px-3 py-1"
      >
        <span className="hidden sm:inline">Sign Up</span>
        <span className="sm:hidden">Join</span>
      </Button>
    </div>
  );
}