import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, MessageSquare, User } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface AuthButtonsProps {
  isLoading: boolean;
  isLoggedIn: boolean;
  scrollToPricing: () => void;
  isMobile: boolean;
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
    if (isMobile) {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link to="/chat" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat Now
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/account" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center font-medium">
              Dashboard
            </Link>
          </DropdownMenuItem>
        </>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-3">
          <LanguageSelector />
          <NotificationBell />
        </div>
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
        <Button 
          asChild
          size="sm"
          className="bg-brand-gold text-black hover:bg-brand-gold/90"
        >
          <Link to="/dashboard">
            Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        <DropdownMenuItem asChild>
          <Link to="/login" className="flex items-center">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={scrollToPricing}>
          Sign Up
        </DropdownMenuItem>
      </>
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
          Login
        </Link>
      </Button>
      <Button 
        onClick={scrollToPricing}
        size="sm"
        className="bg-brand-gold text-black hover:bg-brand-gold/90"
      >
        Sign Up
      </Button>
    </div>
  );
}