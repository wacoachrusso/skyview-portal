
import { AskSkyGuideButton } from "./AskSkyGuideButton";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface NavbarActionsProps {
  isLoggedIn: boolean;
  isLoading: boolean;
}

export function NavbarActions({ isLoggedIn, isLoading }: NavbarActionsProps) {
  // Only show actions when logged in and not loading
  if (!isLoggedIn || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <AskSkyGuideButton />
      <NotificationBell />
    </div>
  );
}
