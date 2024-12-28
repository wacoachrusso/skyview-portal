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
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const NotificationManager = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNewNotificationDialog, setShowNewNotificationDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system",
    profile_id: "",
  });
  const { toast } = useToast();

  const { data: notifications, refetch } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      console.log("Fetching notifications with profile data...");
      const { data, error } = await supabase
        .from("notifications")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      console.log("Fetched notifications:", data);
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");
      if (error) throw error;
      return data;
    },
  });

  const handleSendNotification = async () => {
    try {
      console.log("Sending notification:", newNotification);
      const { error } = await supabase.from("notifications").insert([
        {
          ...newNotification,
          user_id: newNotification.profile_id, // Set user_id to match profile_id
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      setShowNewNotificationDialog(false);
      setNewNotification({
        title: "",
        message: "",
        type: "system",
        profile_id: "",
      });
      refetch();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notification History</h2>
        <Button onClick={() => setShowNewNotificationDialog(true)}>
          Send New Notification
        </Button>
      </div>

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
                  {(notification.profiles as any)?.full_name || "N/A"}
                </TableCell>
                <TableCell>
                  {format(new Date(notification.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={notification.is_read ? "secondary" : "default"}
                  >
                    {notification.is_read ? "Read" : "Unread"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("View notification details:", notification);
                      setSelectedNotification(notification);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Title</h4>
              <p className="text-sm text-muted-foreground">
                {selectedNotification?.title}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Message</h4>
              <p className="text-sm text-muted-foreground">
                {selectedNotification?.message}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Recipient</h4>
              <p className="text-sm text-muted-foreground">
                {(selectedNotification?.profiles as any)?.full_name || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Type</h4>
              <Badge variant="outline">{selectedNotification?.type}</Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <Badge
                variant={selectedNotification?.is_read ? "secondary" : "default"}
              >
                {selectedNotification?.is_read ? "Read" : "Unread"}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Sent At</h4>
              <p className="text-sm text-muted-foreground">
                {selectedNotification &&
                  format(
                    new Date(selectedNotification.created_at),
                    "MMM d, yyyy HH:mm:ss"
                  )}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNewNotificationDialog}
        onOpenChange={setShowNewNotificationDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send New Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={newNotification.profile_id}
                onValueChange={(value) =>
                  setNewNotification({ ...newNotification, profile_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || "Unnamed User"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value) =>
                  setNewNotification({ ...newNotification, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    message: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewNotificationDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendNotification}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};