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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const UserManagement = () => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
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
                  <Switch
                    checked={user.is_admin || false}
                    disabled={updatingUser === user.id}
                    onCheckedChange={() =>
                      toggleAdminStatus(user.id, user.is_admin || false)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    View Details
                  </Button>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};