import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface LoggedInButtonsProps {
  isMobile: boolean;
  showChatOnly: boolean;
  handleLogout: () => void;
}

export function LoggedInButtons({
  isMobile,
  showChatOnly,
  handleLogout,
}: LoggedInButtonsProps) {
  // Don't include the "Ask SkyGuide" button here since it's in NavbarActions

  if (showChatOnly) {
    return (
      <Button variant="secondary" asChild>
        <Link to="/chat">Chat</Link>
      </Button>
    );
  }

  if (isMobile) {
    return (
      <>
        <Button variant="secondary" asChild>
          <Link to="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/account">Account</Link>
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </>
    );
  }

  return (
    <>
      {/* No "Ask SkyGuide" button here */}
      <div
        className={`flex ${
          isMobile ? "flex-col w-full gap-2" : "items-center gap-4"
        }`}
      >
        <Button
          asChild
          variant={isMobile ? "ghost" : "secondary"}
          size="sm"
          className={`${
            isMobile ? "w-full justify-start" : "text-white hover:text-white/90"
          }`}
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
          className={`${
            isMobile ? "w-full justify-start" : "text-white hover:text-white/90"
          }`}
        >
          <Link to="/dashboard">Dashboard</Link>
        </Button>

        <Button
          onClick={handleLogout}
          size="sm"
          variant={isMobile ? "ghost" : "destructive"}
          className={`${
            isMobile
              ? "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              : ""
          }`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );
}
