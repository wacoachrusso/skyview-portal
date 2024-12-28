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

export const NotificationManager = () => {
  const { data: notifications } = useQuery({
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notification History</h2>
        <Button>Send New Notification</Button>
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
    </div>
  );
};