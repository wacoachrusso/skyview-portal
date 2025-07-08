
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  const getSubscriptionBadge = (plan: string | null, isAdmin: boolean) => {
    if (isAdmin) {
      return <Badge className="bg-purple-500 hover:bg-purple-600 whitespace-nowrap">Admin Plan</Badge>;
    }
    
    if (!plan || plan === 'free') {
      return <Badge variant="destructive">Free</Badge>;
    }
    
    if (plan === 'monthly') {
      return <Badge variant="default">Monthly</Badge>;
    }
    
    if (plan === 'annual') {
      return <Badge variant="default">Annual</Badge>;
    }
    
    return <Badge variant="outline">{plan}</Badge>;
  };

  const handleAdminToggle = async (userId: string, currentAdminStatus: boolean) => {
    console.log("AdminToggle clicked - User ID:", userId, "Current admin status:", currentAdminStatus);
    await toggleAdminStatus(userId, currentAdminStatus);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Airline</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Query Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || "N/A"}</TableCell>
              <TableCell>{user.email || "N/A"}</TableCell>
              <TableCell>{user.user_type || "N/A"}</TableCell>
              <TableCell>{user.airline || "N/A"}</TableCell>
              <TableCell>
                {user.created_at && format(new Date(user.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{user.query_count || 0}</TableCell>
              <TableCell>
                <UserStatusBadge status={user.account_status || "active"} />
              </TableCell>
              <TableCell>
                {getSubscriptionBadge(user.subscription_plan, user.is_admin || false)}
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.is_admin || false}
                  disabled={updatingUser === user.id}
                  onCheckedChange={() => handleAdminToggle(user.id, user.is_admin || false)}
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
                  <UserActionsDropdown
                    user={user}
                    updateAccountStatus={updateAccountStatus}
                    setUserToDelete={setUserToDelete}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
