import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
import { useState } from "react";

export function LogoutButton() {
  const { handleLogout } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant="destructive"
      className="w-full mt-6"
      onClick={handleLogoutClick}
      disabled={isLoggingOut}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </Button>
  );
}