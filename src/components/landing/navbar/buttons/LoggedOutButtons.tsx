
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

interface LoggedOutButtonsProps {
  isMobile?: boolean;
  scrollToPricing: () => void;
}

export function LoggedOutButtons({ isMobile = false, scrollToPricing }: LoggedOutButtonsProps) {
  return (
    <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
      <Button
        asChild 
        variant={isMobile ? "ghost" : "secondary"}
        size="sm"
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'} cta-button high-contrast-focus`}
        aria-label="Sign in to your account"
      >
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Sign In</span>
        </Link>
      </Button>
      
      <Button
        onClick={scrollToPricing}
        size="sm"
        variant={isMobile ? "ghost" : "default"}
        className={`${isMobile ? 'w-full justify-start' : 'primary-cta text-white hover:text-white/90'} cta-button high-contrast-focus`}
        aria-label="Get started with a free trial"
      >
        Get Started Free
      </Button>
    </div>
  );
}
