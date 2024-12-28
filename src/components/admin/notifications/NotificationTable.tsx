import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NotificationTableProps {
  notifications: any[];
  onViewDetails: (notification: any) => void;
  onDelete: (id: string) => void;
}

export const NotificationTable = ({
  notifications,
  onViewDetails,
  onDelete,
}: NotificationTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications?.map((notification) => (
            <TableRow key={notification.id}>
              <TableCell>
                <Badge variant="outline">{notification.type}</Badge>
              </TableCell>
              <TableCell>{notification.title}</TableCell>
              <TableCell>
                {notification.profile_id === "all" 
                  ? "All Users"
                  : `${(notification.profiles as any)?.full_name || "N/A"} (${(notification.profiles as any)?.email || "No email"})`}
              </TableCell>
              <TableCell>
                {format(new Date(notification.created_at), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant={notification.is_read ? "secondary" : "default"}>
                  {notification.is_read ? "Read" : "Unread"}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(notification)}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};