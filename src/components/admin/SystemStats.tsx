import { useState, useEffect } from "react";
import { Users, UserCheck, Bell, FileText, UserPlus, CreditCard, Star, UserCog, MessageSquare } from "lucide-react";
import { MetricCard } from "./stats/MetricCard";
import { StatsDialog } from "./stats/StatsDialog";
import { useAdminStats } from "@/hooks/useAdminStats";
import { getDialogContent } from "./stats/getDialogContent";
import { supabase } from "@/integrations/supabase/client";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: stats, refetch } = useAdminStats();

  useEffect(() => {
    console.log("Setting up real-time subscriptions for admin stats...");
    
    const channel = supabase
      .channel('admin-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log("Detected change in profiles table, refetching stats...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          console.log("Detected change in notifications table, refetching stats...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'release_notes'
        },
        () => {
          console.log("Detected change in release_notes table, refetching stats...");
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alpha_testers'
        },
        () => {
          console.log("Detected change in alpha_testers table, refetching stats...");
          refetch();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      console.log("Cleaning up real-time subscriptions...");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const dialogContent = getDialogContent(stats?.details, selectedMetric);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Message Feedback"
          value={stats?.messageFeedbackCount || 0}
          icon={MessageSquare}
          onClick={() => {
            setSelectedMetric("messageFeedback");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Active Alpha Testers"
          value={stats?.alphaTestersCount || 0}
          icon={UserCog}
          onClick={() => {
            setSelectedMetric("alphaTesters");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Active Promoters"
          value={stats?.promotersCount || 0}
          icon={Star}
          onClick={() => {
            setSelectedMetric("promoters");
            setIsDialogOpen(true);
          }}
        />
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
