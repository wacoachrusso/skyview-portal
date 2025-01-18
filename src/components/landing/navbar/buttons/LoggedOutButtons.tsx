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
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:bg-brand-gold hover:text-black transition-colors'}`}
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
        className={`${isMobile ? 'w-full justify-start' : 'bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors'}`}
      >
        Sign Up
      </Button>
    </div>
  );
}