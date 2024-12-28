import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Bell, FileText, UserPlus, CreditCard } from "lucide-react";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { MetricCard } from "./stats/MetricCard";
import { StatsDialog } from "./stats/StatsDialog";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      console.log("Fetching admin stats...");
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

      console.log("Stats fetched:", {
        monthlySubCount,
        yearlySubCount,
        monthlySubUsers,
        yearlySubUsers
      });

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
        <MetricCard
          title="Total Users"
          value={stats?.userCount || 0}
          icon={Users}
          onClick={() => {
            setSelectedMetric("users");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Active Users (30d)"
          value={stats?.activeUserCount || 0}
          icon={UserCheck}
          onClick={() => {
            setSelectedMetric("activeUsers");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Notifications Sent"
          value={stats?.notificationCount || 0}
          icon={Bell}
          onClick={() => {
            setSelectedMetric("notifications");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Release Notes"
          value={stats?.releaseNoteCount || 0}
          icon={FileText}
          onClick={() => {
            setSelectedMetric("releaseNotes");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="New Users (30d)"
          value={stats?.newUserCount || 0}
          icon={UserPlus}
          onClick={() => {
            setSelectedMetric("newUsers");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Monthly Subscribers"
          value={stats?.monthlySubCount || 0}
          icon={CreditCard}
          onClick={() => {
            setSelectedMetric("monthlySubUsers");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Yearly Subscribers"
          value={stats?.yearlySubCount || 0}
          icon={CreditCard}
          onClick={() => {
            setSelectedMetric("yearlySubUsers");
            setIsDialogOpen(true);
          }}
        />
      </div>

      <StatsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={dialogContent}
      />
    </>
  );
};