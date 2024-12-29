import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserActionsDropdown } from "./UserActionsDropdown";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

interface UsersTableProps {
  users: ProfilesRow[] | undefined;
  updatingUser: string | null;
  toggleAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
  updateAccountStatus: (userId: string, email: string, status: "disabled" | "suspended" | "deleted" | "active") => Promise<void>;
  setSelectedUser: (user: ProfilesRow) => void;
  setUserToDelete: (user: ProfilesRow) => void;
}

export const UsersTable = ({
  users,
  updatingUser,
  toggleAdminStatus,
  updateAccountStatus,
  setSelectedUser,
  setUserToDelete,
}: UsersTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Query Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow 
              key={user.id}
              className={user.account_status === "deleted" ? "bg-gray-50 dark:bg-gray-800/50" : ""}
            >
              <TableCell>{user.full_name || "N/A"}</TableCell>
              <TableCell>{user.email || "N/A"}</TableCell>
              <TableCell>{user.user_type || "N/A"}</TableCell>
              <TableCell>
                {format(new Date(user.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{user.query_count || 0}</TableCell>
              <TableCell>
                <UserStatusBadge status={user.account_status || "active"} />
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.is_admin || false}
                  disabled={updatingUser === user.id || user.account_status === "deleted"}
                  onCheckedChange={() =>
                    toggleAdminStatus(user.id, user.is_admin || false)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user.account_status !== "deleted" && (
                    <UserActionsDropdown
                      user={user}
                      updateAccountStatus={updateAccountStatus}
                      setUserToDelete={setUserToDelete}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};