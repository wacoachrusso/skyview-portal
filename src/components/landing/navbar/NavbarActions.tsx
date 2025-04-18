import { useEffect, useState } from "react";
import { AskSkyGuideButton } from "./AskSkyGuideButton";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface NavbarActionsProps {
  isLoggedIn: boolean;
  isLoading: boolean;
}

export function NavbarActions({ isLoggedIn, isLoading }: NavbarActionsProps) {
  // Create an immediate state based on localStorage
  const [shouldShowActions, setShouldShowActions] = useState(() => {
    return localStorage.getItem('auth_status') === 'logged_in';
  });
  
  // Update our local state whenever props change (after API call completes)
  useEffect(() => {
    if (!isLoading) {
      setShouldShowActions(isLoggedIn);
    }
  }, [isLoggedIn, isLoading]);

  // Show actions immediately based on localStorage, don't wait for props
  if (!shouldShowActions) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <AskSkyGuideButton />
    </div>
  );
}