
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { Badge } from "@/components/ui/badge";

interface UserDetailsDialogProps {
  user: ProfilesRow | null;
  onClose: () => void;
}

export const UserDetailsDialog = ({ user, onClose }: UserDetailsDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Full Name:</div>
            <div className="col-span-3">{user.full_name || "N/A"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Email:</div>
            <div className="col-span-3">{user.email || "N/A"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">User Type:</div>
            <div className="col-span-3">{user.user_type || "N/A"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Airline:</div>
            <div className="col-span-3">{user.airline || "N/A"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Admin Status:</div>
            <div className="col-span-3">
              {user.is_admin ? (
                <Badge className="bg-purple-500">Admin</Badge>
              ) : (
                <Badge variant="outline">User</Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Plan:</div>
            <div className="col-span-3">
              <Badge className={user.is_admin ? "bg-green-500" : ""}>
                {user.subscription_plan || "N/A"}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Queries:</div>
            <div className="col-span-3">{user.query_count || 0}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Last Query:</div>
            <div className="col-span-3">
              {user.last_query_timestamp
                ? format(
                    new Date(user.last_query_timestamp),
                    "MMM d, yyyy HH:mm"
                  )
                : "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Last IP:</div>
            <div className="col-span-3">
              {user.last_ip_address || "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Status:</div>
            <div className="col-span-3">
              {user.account_status || "active"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
