import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

interface LoggedInButtonsProps {
  isMobile?: boolean;
}

export function LoggedInButtons({ isMobile = false }: LoggedInButtonsProps) {
  return (
    <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
      <Button
        asChild
        variant={isMobile ? "ghost" : "secondary"}
        size="sm"
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'}`}
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
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'}`}
      >
        <Link to="/dashboard">
          Dashboard
        </Link>
      </Button>
    </div>
  );
}