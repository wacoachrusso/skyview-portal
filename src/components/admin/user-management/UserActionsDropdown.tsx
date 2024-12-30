import { AlertCircle, Ban, CheckCircle, Undo2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

interface UserActionsDropdownProps {
  user: ProfilesRow;
  updateAccountStatus: (userId: string, email: string, status: "disabled" | "suspended" | "deleted" | "active") => Promise<void>;
  setUserToDelete: (user: ProfilesRow) => void;
}

export const UserActionsDropdown = ({
  user,
  updateAccountStatus,
  setUserToDelete,
}: UserActionsDropdownProps) => {
  const getAccountActions = (user: ProfilesRow) => {
    switch (user.account_status) {
      case "disabled":
      case "suspended":
        return (
          <DropdownMenuItem
            onClick={() => updateAccountStatus(user.id, user.email || "", "active")}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/10"
          >
            <Undo2 className="h-4 w-4 mr-2" />
            {user.account_status === "disabled" ? "Re-enable Account" : "Unsuspend Account"}
          </DropdownMenuItem>
        );
      default:
        return (
          <>
            <DropdownMenuItem
              onClick={() => updateAccountStatus(user.id, user.email || "", "disabled")}
              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
            >
              <Ban className="h-4 w-4 mr-2" />
              Disable Account
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateAccountStatus(user.id, user.email || "", "suspended")}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Suspend Account
            </DropdownMenuItem>
          </>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <AlertCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
        align="end"
        sideOffset={5}
      >
        {getAccountActions(user)}
        {user.account_status !== "deleted" && (
          <DropdownMenuItem
            onClick={() => setUserToDelete(user)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Delete Account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};