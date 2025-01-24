import { MessageSquare } from "lucide-react";
import { AuthButtons } from "./AuthButtons";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Link } from "react-router-dom";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, MessageSquare as Chat, User, LogOut } from "lucide-react";

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
  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    const tabs = [
      { path: "/dashboard", title: "Dashboard" },
      { path: "/chat", title: "Chat" },
      { path: "/account", title: "Account" }
    ];
    
    const selectedTab = tabs[index];
    if (selectedTab) {
      window.location.href = selectedTab.path;
    }
  };

  return (
    <div className="md:hidden">
      {isLoggedIn && !isLoading ? (
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ExpandableTabs
            tabs={[
              { title: "Dashboard", icon: Home },
              { title: "Chat", icon: Chat },
              { type: "separator" },
              { title: "Account", icon: User },
              { title: "Sign Out", icon: LogOut }
            ]}
            className="border-border/40"
            onChange={handleTabChange}
          />
        </div>
      ) : (
        <AuthButtons 
          isLoading={isLoading} 
          isLoggedIn={isLoggedIn} 
          scrollToPricing={scrollToPricing}
          isMobile={true}
        />
      )}
    </div>
  );
}