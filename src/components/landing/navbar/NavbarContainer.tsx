
import { Logo } from "./Logo";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";
import { useNavbarAuth } from "@/hooks/landing/useNavbarAuth";
import { useLogoClickHandler } from "@/hooks/landing/useLogoClickHandler";
import { usePricingScroll } from "@/hooks/landing/usePricingScroll";
import { useMobileMenuState } from "@/hooks/landing/useMobileMenuState";

export function NavbarContainer() {
  // Use our custom hooks to separate logic from presentation
  const { isLoggedIn, isLoading } = useNavbarAuth();
  const { handleLogoClick } = useLogoClickHandler();
  const { scrollToPricing } = usePricingScroll();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenuState();

  return (
    <nav className="fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Logo handleLogoClick={handleLogoClick} />
          
          <NavbarActions 
            isLoggedIn={isLoggedIn} 
            isLoading={isLoading} 
          />
          
          <div className="hidden md:flex items-center space-x-4">
            <AuthButtons 
              isLoading={isLoading} 
              isLoggedIn={isLoggedIn} 
              scrollToPricing={scrollToPricing}
            />
          </div>

          <MobileMenu 
            isLoggedIn={isLoggedIn}
            isLoading={isLoading}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            scrollToPricing={scrollToPricing}
          />
        </div>
      </div>
    </nav>
  );
}
