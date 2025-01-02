import { Menu } from "lucide-react";
import { AuthButtons } from "./AuthButtons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      {isLoggedIn && (
        <AuthButtons 
          isLoading={isLoading} 
          isLoggedIn={isLoggedIn} 
          scrollToPricing={scrollToPricing}
          isMobile={true}
          showChatOnly={true}
        />
      )}
      <DropdownMenu 
        open={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
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