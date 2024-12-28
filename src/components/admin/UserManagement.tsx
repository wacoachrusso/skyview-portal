import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye, Ban, Trash2, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserStatusBadge } from "./user-management/UserStatusBadge";
import { UserDetailsDialog } from "./user-management/UserDetailsDialog";
import { DeleteUserDialog } from "./user-management/DeleteUserDialog";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const UserManagement = () => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfilesRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<ProfilesRow | null>(null);

  const { data: users, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("Fetching users data...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      console.log("Users data fetched:", data);
      return data as ProfilesRow[];
    },
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log("Toggling admin status for user:", userId);
      setUpdatingUser(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error updating user admin status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user admin status",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateAccountStatus = async (
    userId: string,
    email: string,
    status: "disabled" | "suspended" | "deleted"
  ) => {
    try {
      console.log(`Updating account status to ${status} for user:`, userId);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke(
        "send-account-status-email",
        {
          body: { email, status },
        }
      );

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: `User account ${status} successfully`,
      });
      refetch();
    } catch (error) {
      console.error(`Error ${status} user account:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${status} user account`,
      });
    }
  };

  const handleDeleteUser = async (user: ProfilesRow) => {
    try {
      console.log("Deleting user:", user);

      // First update the account status and send email
      await updateAccountStatus(user.id, user.email || "", "deleted");

      // Then delete the user profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User account deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user account",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
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
              <TableRow key={user.id}>
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
                    disabled={updatingUser === user.id}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            updateAccountStatus(user.id, user.email || "", "disabled")
                          }
                          className="text-yellow-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Disable Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateAccountStatus(user.id, user.email || "", "suspended")
                          }
                          className="text-orange-600"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserDetailsDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <DeleteUserDialog
        user={userToDelete}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};