import { useLocation } from "react-router-dom";
import { DashboardLogo } from "./DashboardLogo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <DashboardLogo />
          <DesktopNav isAccountPage={isAccountPage} onSignOut={onSignOut} />
          <MobileNav isAccountPage={isAccountPage} onSignOut={onSignOut} />
        </div>
      </div>
    </nav>
  );
};