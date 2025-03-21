
import { Menu, MessageSquare } from "lucide-react";
import { AuthButtons } from "./AuthButtons";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  scrollToPricing: () => void;
}

export function MobileMenu({
  isLoggedIn,
  isLoading,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  scrollToPricing
}: MobileMenuProps) {
  return (
    <div className="md:hidden flex items-center gap-2">
      {isLoggedIn && !isLoading && (
        <div className="flex items-center gap-2">
          <Link 
            to="/chat"
            className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
            aria-label="Open chat"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>
          <NotificationBell />
        </div>
      )}
      <DropdownMenu 
        open={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 p-0"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="w-56 bg-background/95 backdrop-blur-sm border border-border mt-2"
        >
          <div className="p-2">
            <AuthButtons 
              isLoading={isLoading} 
              isLoggedIn={isLoggedIn} 
              scrollToPricing={scrollToPricing}
              isMobile={true}
              showChatOnly={false}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
