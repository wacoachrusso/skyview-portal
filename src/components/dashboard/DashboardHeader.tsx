
import { useLocation, Link } from "react-router-dom";
import { DashboardLogo } from "./DashboardLogo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {!isDashboard && (
              <Button 
                asChild
                variant="ghost" 
                size="sm"
                className="mr-2 text-muted-foreground hover:text-foreground"
              >
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            )}
            <DashboardLogo />
          </div>
          <div className="flex items-center space-x-4">
            <DesktopNav isAccountPage={isAccountPage} onSignOut={onSignOut} />
            <MobileNav isAccountPage={isAccountPage} onSignOut={onSignOut} />
          </div>
        </div>
      </div>
    </nav>
  );
};
