import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

export function LogoutButton() {
  const { handleLogout } = useLogout();

  return (
    <Button
      variant="destructive"
      className="w-full mt-6"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Log Out
    </Button>
  );
}