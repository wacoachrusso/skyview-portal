import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Bell, FileText, UserPlus, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { format, subDays } from "date-fns";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const [
        { count: userCount, data: users },
        { count: activeUserCount, data: activeUsers },
        { count: notificationCount, data: notifications },
        { count: releaseNoteCount, data: releaseNotes },
        { count: newUserCount, data: newUsers },
        { count: monthlySubCount, data: monthlySubUsers },
        { count: yearlySubCount, data: yearlySubUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .gte("last_query_timestamp", thirtyDaysAgo),
        supabase.from("notifications").select("*", { count: "exact" }),
        supabase.from("release_notes").select("*", { count: "exact" }),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .gte("created_at", thirtyDaysAgo),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("subscription_plan", "monthly"),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("subscription_plan", "yearly"),
      ]);

      return {
        userCount,
        activeUserCount,
        notificationCount,
        releaseNoteCount,
        newUserCount,
        monthlySubCount,
        yearlySubCount,
        details: {
          users,
          activeUsers,
          notifications,
          releaseNotes,
          newUsers,
          monthlySubUsers,
          yearlySubUsers,
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
      activeUsers: {
        title: "Active User Details",
        data: stats.details.activeUsers?.map((user) => ({
          label: user.full_name || "Unnamed User",
          info: `Email: ${user.email || "N/A"} | Last Active: ${
            user.last_query_timestamp
              ? format(new Date(user.last_query_timestamp), "MMM d, yyyy")
              : "N/A"
          }`,
          date: format(new Date(user.created_at), "MMM d, yyyy"),
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
      newUsers: {
        title: "New Users (Last 30 Days)",
        data: stats.details.newUsers?.map((user) => ({
          label: user.full_name || "Unnamed User",
          info: `Email: ${user.email || "N/A"} | Type: ${user.user_type || "N/A"}`,
          date: format(new Date(user.created_at), "MMM d, yyyy"),
        })),
      },
      monthlySubUsers: {
        title: "Monthly Subscription Users",
        data: stats.details.monthlySubUsers?.map((user) => ({
          label: user.full_name || "Unnamed User",
          info: `Email: ${user.email || "N/A"}`,
          date: `Joined: ${format(new Date(user.created_at), "MMM d, yyyy")}`,
        })),
      },
      yearlySubUsers: {
        title: "Yearly Subscription Users",
        data: stats.details.yearlySubUsers?.map((user) => ({
          label: user.full_name || "Unnamed User",
          info: `Email: ${user.email || "N/A"}`,
          date: `Joined: ${format(new Date(user.created_at), "MMM d, yyyy")}`,
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
            setSelectedMetric("activeUsers");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (30d)</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUserCount || 0}</div>
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

        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("newUsers");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newUserCount || 0}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("monthlySubUsers");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Subscribers</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlySubCount || 0}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => {
            setSelectedMetric("yearlySubUsers");
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Subscribers</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.yearlySubCount || 0}</div>
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