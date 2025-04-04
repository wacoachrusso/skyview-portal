
import { useLocation, Link } from "react-router-dom";
import { DashboardLogo } from "./DashboardLogo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';
  const isDashboard = location.pathname === '/dashboard';
  const isMobile = useIsMobile();

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            {!isDashboard && (
              <Button 
                asChild
                variant="ghost" 
                size={isMobile ? "icon" : "sm"}
                className="mr-1 sm:mr-2 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
              >
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  {!isMobile && <span className="ml-1">Dashboard</span>}
                </Link>
              </Button>
            )}
            <DashboardLogo />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DesktopNav isAccountPage={isAccountPage} onSignOut={onSignOut} />
            <MobileNav isAccountPage={isAccountPage} onSignOut={onSignOut} />
          </div>
        </div>
      </div>
    </nav>
  );
};
