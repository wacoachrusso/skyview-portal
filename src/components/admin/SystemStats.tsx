import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Bell, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: userCount, data: users },
        { count: messageCount, data: messages },
        { count: notificationCount, data: notifications },
        { count: releaseNoteCount, data: releaseNotes },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("messages").select("*", { count: "exact" }),
        supabase.from("notifications").select("*", { count: "exact" }),
        supabase.from("release_notes").select("*", { count: "exact" }),
      ]);

      return {
        userCount,
        messageCount,
        notificationCount,
        releaseNoteCount,
        details: {
          users,
          messages,
          notifications,
          releaseNotes,
        },
      };
    },
  });

  const getDialogContent = () => {
    if (!stats?.details || !selectedMetric) return null;

    const content = {
      users: {
        title: "User Details",
        data: stats.details.users?.map((user) => ({
          label: user.full_name || "Unnamed User",
          info: `Email: ${user.email || "N/A"} | Type: ${user.user_type || "N/A"}`,
          date: format(new Date(user.created_at), "MMM d, yyyy"),
        })),
      },
      messages: {
        title: "Message Details",
        data: stats.details.messages?.map((msg) => ({
          label: msg.content.substring(0, 50) + "...",
          info: `Role: ${msg.role}`,
          date: format(new Date(msg.created_at), "MMM d, yyyy"),
        })),
      },
      notifications: {
        title: "Notification Details",
        data: stats.details.notifications?.map((notif) => ({
          label: notif.title,
          info: notif.message,
          date: format(new Date(notif.created_at), "MMM d, yyyy"),
        })),
      },
      releaseNotes: {
        title: "Release Notes Details",
        data: stats.details.releaseNotes?.map((note) => ({
          label: note.title,
          info: `Version: ${note.version}`,
          date: format(new Date(note.created_at), "MMM d, yyyy"),
        })),
      },
    };

    return content[selectedMetric as keyof typeof content];
  };

  const dialogContent = getDialogContent();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("users");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("messages");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messageCount || 0}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("notifications");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notifications Sent
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.notificationCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("releaseNotes");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Release Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.releaseNoteCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogContent?.data?.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 hover:bg-muted/50"
              >
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.info}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};