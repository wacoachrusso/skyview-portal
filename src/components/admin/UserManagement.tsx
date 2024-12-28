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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const UserManagement = () => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

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
      return data;
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

  const handleViewDetails = (user: any) => {
    console.log("Opening details for user:", user);
    setSelectedUser(user);
  };

  const updateAccountStatus = async (userId: string, email: string, status: 'disabled' | 'suspended' | 'deleted') => {
    try {
      console.log(`Updating account status to ${status} for user:`, userId);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-account-status-email', {
        body: { email, status }
      });

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

  const handleDeleteUser = async (user: any) => {
    try {
      console.log("Deleting user:", user);
      
      // First update the account status and send email
      await updateAccountStatus(user.id, user.email, 'deleted');
      
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
      setShowDeleteAlert(false);
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
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    user.account_status === 'disabled' ? 'bg-gray-200 text-gray-700' :
                    user.account_status === 'suspended' ? 'bg-yellow-200 text-yellow-700' :
                    user.account_status === 'deleted' ? 'bg-red-200 text-red-700' :
                    'bg-green-200 text-green-700'
                  }`}>
                    {user.account_status || 'active'}
                  </span>
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
                      onClick={() => handleViewDetails(user)}
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
                          onClick={() => updateAccountStatus(user.id, user.email, 'disabled')}
                          className="text-yellow-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Disable Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateAccountStatus(user.id, user.email, 'suspended')}
                          className="text-orange-600"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteAlert(true);
                          }}
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

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Full Name:</div>
                <div className="col-span-3">{selectedUser.full_name || "N/A"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email:</div>
                <div className="col-span-3">{selectedUser.email || "N/A"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">User Type:</div>
                <div className="col-span-3">{selectedUser.user_type || "N/A"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Airline:</div>
                <div className="col-span-3">{selectedUser.airline || "N/A"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Plan:</div>
                <div className="col-span-3">
                  {selectedUser.subscription_plan || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Queries:</div>
                <div className="col-span-3">{selectedUser.query_count || 0}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Last Query:</div>
                <div className="col-span-3">
                  {selectedUser.last_query_timestamp
                    ? format(
                        new Date(selectedUser.last_query_timestamp),
                        "MMM d, yyyy HH:mm"
                      )
                    : "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Last IP:</div>
                <div className="col-span-3">
                  {selectedUser.last_ip_address || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Status:</div>
                <div className="col-span-3">
                  {selectedUser.account_status || "active"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user's
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};